import { Poll, IPoll } from '../models/Poll';
import { EventEmitter } from 'events';
import chatService from './chatService';

export const pollEvents = new EventEmitter();

class PollService {
    private pollTimers = new Map<string, NodeJS.Timeout>();

    async createPoll(question: string, options: { text: string }[], duration: number): Promise<IPoll> {


        if (!options || options.length < 2) {
            throw new Error('A poll must have at least 2 options.');
        }

        const formattedOptions = options.map(opt => ({ text: opt.text, votes: 0 }));
        const poll = new Poll({
            question,
            options: formattedOptions,
            duration,
            status: 'DRAFT'
        });

        return await poll.save();
    }

    async startPoll(pollId: string): Promise<IPoll> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.status !== 'DRAFT') throw new Error(`Cannot start poll from status: ${poll.status}`);

        // Block if there's already another ACTIVE poll
        const activePollExists = await Poll.exists({ status: 'ACTIVE' });
        if (activePollExists) {
            throw new Error('Another poll is already active. Wait for it to complete before starting this one.');
        }

        poll.status = 'ACTIVE';
        poll.startTime = new Date();
        await poll.save();

        this.schedulePollEnd(poll.id, poll.duration * 1000);

        pollEvents.emit('poll_started', poll);

        return poll;
    }

    async completePoll(pollId: string): Promise<IPoll> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.status !== 'ACTIVE') throw new Error(`Cannot complete poll from status: ${poll.status}`);

        poll.status = 'COMPLETED';
        await poll.save();

        const timer = this.pollTimers.get(poll.id);
        if (timer) {
            clearTimeout(timer);
            this.pollTimers.delete(poll.id);
        }

        pollEvents.emit('poll_ended', poll.id);

        return poll;
    }

    async cancelPoll(pollId: string): Promise<IPoll> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.status !== 'DRAFT') throw new Error(`Cannot cancel poll from status: ${poll.status}`);

        poll.status = 'CANCELLED';
        await poll.save();

        return poll;
    }

    async getPollState(pollId: string): Promise<{ poll: IPoll, serverTime: Date }> {
        const poll = await Poll.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        return { poll, serverTime: new Date() };
    }

    async getActivePoll(): Promise<IPoll | null> {
        return await Poll.findOne({ status: 'ACTIVE' });
    }

    async getPollHistory(): Promise<IPoll[]> {
        return await Poll.find({ status: { $in: ['COMPLETED', 'CANCELLED'] } }).sort({ startTime: -1 });
    }

    async recoverActivePolls(): Promise<void> {
        const activePolls = await Poll.find({ status: 'ACTIVE' });
        const now = Date.now();

        for (const poll of activePolls) {
            if (!poll.startTime) continue;

            const durationMs = poll.duration * 1000;
            const timeRemaining = durationMs - (now - poll.startTime.getTime());

            if (timeRemaining <= 0) {
                await this.completePoll(poll.id).catch(err => console.error(err));
                console.log(`Recovered and ended expired poll ${poll.id}`);
            } else {
                this.schedulePollEnd(poll.id, timeRemaining);
                console.log(`Rescheduled timer for active poll ${poll.id}`);
            }
        }
    }

    private schedulePollEnd(pollId: string, delayMs: number) {
        const timer = setTimeout(async () => {
            try {
                await this.completePoll(pollId);
                console.log(`Poll ${pollId} ended automatically.`);
            } catch (err) {
                console.error(`Error auto-ending poll ${pollId}:`, err);
            }
        }, delayMs);
        this.pollTimers.set(pollId, timer);
    }
}

export default new PollService();
