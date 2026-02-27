import mongoose from 'mongoose';
import { Vote, IVote } from '../models/Vote';
import { Poll } from '../models/Poll';
import { pollEvents } from './pollService';

class VoteService {
    async submitVote(pollId: string, studentName: string, selectedOption: string): Promise<IVote> {
        const poll = await Poll.findById(pollId);
        if (!poll) {
            throw new Error('Poll not found');
        }

        if (poll.status !== 'ACTIVE') {
            throw new Error('Poll is not active');
        }

        if (poll.startTime) {
            const expirationTime = poll.startTime.getTime() + poll.duration * 1000;
            if (Date.now() >= expirationTime) {
                throw new Error('Poll has expired');
            }
        }

        const validOption = poll.options.find((opt: any) => opt.text === selectedOption || opt._id?.toString() === selectedOption);
        if (!validOption) {
            throw new Error('Invalid option selected');
        }

        try {
            const vote = new Vote({
                pollId,
                studentName,
                selectedOption
            });

            await vote.save();

            await Poll.updateOne(
                { _id: poll._id, 'options._id': (validOption as any)._id },
                { $inc: { 'options.$.votes': 1 } }
            );

            pollEvents.emit('vote_cast', { pollId, selectedOption, studentName });

            return vote;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new Error('User has already voted on this poll');
            }
            throw error;
        }
    }

    async getVoteCounts(pollId: string): Promise<Record<string, number>> {
        const objectId = new mongoose.Types.ObjectId(pollId);

        const results = await Vote.aggregate([
            { $match: { pollId: objectId } },
            { $group: { _id: '$selectedOption', count: { $sum: 1 } } }
        ]);

        const counts: Record<string, number> = {};
        results.forEach(res => {
            counts[res._id] = res.count;
        });

        return counts;
    }

    async getTotalVoteCount(pollId: string): Promise<number> {
        return await Vote.countDocuments({ pollId });
    }

    async removeVote(pollId: string, studentName: string): Promise<boolean> {
        // remove student vote
        const vote = await Vote.findOneAndDelete({ pollId, studentName });
        if (!vote) {
            return false;
        }

        // Fetch the poll to find the matching option (could be text or _id)
        const poll = await Poll.findById(pollId);
        if (poll) {
            const matchedOption = poll.options.find((opt: any) =>
                opt.text === vote.selectedOption || opt._id?.toString() === vote.selectedOption
            );
            if (matchedOption) {
                await Poll.updateOne(
                    { _id: pollId, 'options._id': (matchedOption as any)._id },
                    { $inc: { 'options.$.votes': -1 } }
                );
            }
        }

        // Sync results
        pollEvents.emit('vote_cast', { pollId, selectedOption: vote.selectedOption, studentName });

        return true;
    }
}

export default new VoteService();
