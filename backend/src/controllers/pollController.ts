import { Request, Response } from 'express';
import pollService from '../services/pollService';
import voteService from '../services/voteService';
import { getPollParticipants } from '../services/participantService';

export const createPollHandler = async (req: Request, res: Response) => {
    try {
        const { question, options, duration } = req.body;

        if (!question || !options || !duration) {
            return res.status(400).json({ error: 'Missing required fields: question, options, duration' });
        }

        const poll = await pollService.createPoll(question, options, duration);
        res.status(201).json(poll);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const startPollHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const poll = await pollService.startPoll(id);
        res.status(200).json(poll);
    } catch (error: any) {
        if (error.message === 'Poll not found') return res.status(404).json({ error: error.message });
        if (error.message.includes('Cannot start poll')) return res.status(400).json({ error: error.message });
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const endPollHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const poll = await pollService.completePoll(id);
        res.status(200).json(poll);
    } catch (error: any) {
        if (error.message === 'Poll not found') return res.status(404).json({ error: error.message });
        if (error.message.includes('Cannot complete poll')) return res.status(400).json({ error: error.message });
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getPollStateHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { poll, serverTime } = await pollService.getPollState(id);
        const votes = await voteService.getVoteCounts(id);

        res.status(200).json({
            poll,
            serverTime,
            votes
        });
    } catch (error: any) {
        if (error.message === 'Poll not found') return res.status(404).json({ error: error.message });
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getActivePollHandler = async (req: Request, res: Response) => {
    try {
        const poll = await pollService.getActivePoll();
        if (!poll) {
            return res.status(200).json({ message: 'No active poll found', poll: null });
        }
        const votes = await voteService.getVoteCounts(poll.id);
        res.status(200).json({ poll, serverTime: new Date(), votes });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getPollHistoryHandler = async (req: Request, res: Response) => {
    try {
        const history = await pollService.getPollHistory();
        res.status(200).json(history);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const getParticipantsHandler = async (req: Request, res: Response) => {
    try {
        const { students, count } = await getPollParticipants('global_lobby');
        res.status(200).json({ students, count });
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
