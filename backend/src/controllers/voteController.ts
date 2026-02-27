import { Request, Response } from 'express';
import voteService from '../services/voteService';

export const submitVoteHandler = async (req: Request, res: Response) => {
    try {
        const { pollId, studentName, selectedOption } = req.body;

        if (!pollId || !studentName || !selectedOption) {
            return res.status(400).json({ error: 'Missing required fields: pollId, studentName, selectedOption' });
        }

        const vote = await voteService.submitVote(pollId, studentName, selectedOption);
        res.status(201).json(vote);
    } catch (error: any) {
        if (error.message === 'Poll not found') return res.status(404).json({ error: error.message });

        if (['Poll is not active', 'Poll has expired', 'Invalid option selected'].includes(error.message)) {
            return res.status(400).json({ error: error.message });
        }

        if (error.message === 'User has already voted on this poll') {
            return res.status(403).json({ error: error.message });
        }

        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};
