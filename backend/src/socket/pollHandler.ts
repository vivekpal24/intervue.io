import { Server, Socket } from 'socket.io';
import pollService, { pollEvents } from '../services/pollService';
import voteService from '../services/voteService';
import chatService from '../services/chatService';
import { addParticipant, removeParticipantBySocket, getPollParticipants, clearPollRegistry, kickStudent, unkickStudent } from '../services/participantService';

export class PollSocketHandler {
    private io: Server;
    private rateLimits = new Map<string, { count: number, resetTime: number }>();

    constructor(io: Server) {
        this.io = io;
        this.setupServiceListeners();
        this.setupSocketListeners();
    }

    private checkRateLimit(socketId: string, maxRequests: number, windowMs: number): boolean {
        const now = Date.now();
        const info = this.rateLimits.get(socketId);

        if (!info) {
            this.rateLimits.set(socketId, { count: 1, resetTime: now + windowMs });
            return true;
        }

        if (now > info.resetTime) {
            info.count = 1;
            info.resetTime = now + windowMs;
            return true;
        }

        if (info.count >= maxRequests) {
            return false;
        }

        info.count++;
        return true;
    }

    private async broadcastParticipantUpdate() {
        try {
            const { students } = await getPollParticipants('global_lobby');
            const activeCount = students.filter(s => s.status === 'active').length;
            let totalVoted = 0;
            const activePollId = await pollService.getActivePoll().then(p => p?.id);
            if (activePollId) {
                totalVoted = await voteService.getTotalVoteCount(activePollId);
            }

            this.io.emit('participantCountUpdated', {
                connectedStudents: students,
                totalParticipants: activeCount,
                totalVoted
            });
        } catch (error) {
            console.error('Error broadcasting participants:', error);
        }
    }

    private setupServiceListeners() {
        pollEvents.on('vote_cast', async ({ pollId }) => {
            try {
                const [poll, votes] = await Promise.all([
                    pollService.getPollState(pollId),
                    voteService.getVoteCounts(pollId)
                ]);

                // Merge live vote counts into a clean JSON object
                const pollObj = poll.poll.toJSON() as any;
                const pollWithVotes = {
                    ...pollObj,
                    _id: pollObj._id.toString(), // Ensure string ID
                    options: poll.poll.options.map((opt: any) => {
                        const optObj = opt.toObject();
                        return {
                            ...optObj,
                            _id: optObj._id?.toString(),
                            votes: votes[opt.text] || votes[opt._id?.toString()] || 0
                        };
                    })
                };

                this.io.emit('pollUpdated', pollWithVotes);
                await this.broadcastParticipantUpdate();
            } catch (error) {
                console.error('Error emitting pollUpdated:', error);
            }
        });

        pollEvents.on('poll_ended', (pollId) => {
            chatService.clearChat();
            // pollId is already a string from pollService.emit
            this.io.emit('pollEnded', { pollId: pollId.toString() });
        });

        pollEvents.on('poll_started', (poll) => {
            const pollObj = poll.toJSON();
            this.io.emit('pollStarted', {
                poll: { ...pollObj, _id: pollObj._id.toString() }
            });
        });
    }

    private setupSocketListeners() {
        this.io.on('connection', async (socket: Socket) => {
            const studentName = socket.handshake.query.studentName as string;

            socket.join('global_lobby');
            socket.emit('chat:history', chatService.getMessages());

            if (studentName) {
                try {
                    await addParticipant('global_lobby', studentName, socket.id);
                    await this.broadcastParticipantUpdate();
                } catch (error: any) {
                    socket.emit('error', { message: error.message });
                    socket.disconnect(true);
                    return;
                }
            }

            socket.on('teacher:startPoll', async ({ pollId }) => {
                try {
                    const poll = await pollService.startPoll(pollId);
                    this.io.to(`poll_${pollId}`).emit('pollStarted', { poll });
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('teacher:endPoll', async ({ pollId }) => {
                try {
                    await pollService.completePoll(pollId);
                    // pollEnded event is handled by pollEvents.on('poll_ended') above
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('teacher:kickStudent', async ({ studentName }) => {
                try {
                    const targetSocketId = await kickStudent('global_lobby', studentName);
                    // kill target student socket
                    this.io.to(targetSocketId).emit('kicked', { message: 'You have been removed by the teacher.' });
                    this.io.sockets.sockets.get(targetSocketId)?.disconnect(true);

                    // clear their vote if active
                    const activePollId = await pollService.getActivePoll().then(p => p?.id);
                    if (activePollId) {
                        await voteService.removeVote(activePollId, studentName);
                    }
                    await this.broadcastParticipantUpdate();
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('teacher:unkickStudent', async ({ studentName }) => {
                try {
                    await unkickStudent('global_lobby', studentName);
                    await this.broadcastParticipantUpdate();
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('student:vote', async ({ pollId, studentName, selectedOption }) => {
                if (!this.checkRateLimit(socket.id, 5, 10000)) {
                    return socket.emit('error', { message: 'Rate limit exceeded. Please wait before voting.' });
                }

                try {
                    await voteService.submitVote(pollId, studentName, selectedOption);
                    // pollUpdated & participantUpdate events are handled by pollEvents.on('vote_cast') above
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('chat:message', ({ sender, text }) => {
                try {
                    const msg = chatService.addMessage(sender, text);
                    this.io.emit('chat:newMessage', msg);
                } catch (err: any) {
                    socket.emit('error', { message: err.message });
                }
            });

            socket.on('disconnect', async () => {
                this.rateLimits.delete(socket.id);
                if (studentName) {
                    try {
                        await removeParticipantBySocket(socket.id);
                        await this.broadcastParticipantUpdate();
                    } catch (err) {
                        console.error('Error on disconnect participant removal:', err);
                    }
                }
            });
        });
    }
}
