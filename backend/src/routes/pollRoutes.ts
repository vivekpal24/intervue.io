import { Router } from 'express';
import { createPollHandler, startPollHandler, endPollHandler, getActivePollHandler, getPollHistoryHandler, getParticipantsHandler } from '../controllers/pollController';
import { createRateLimiter } from '../middlewares/rateLimiter';

const router = Router();
const pollLimiter = createRateLimiter(3, 60 * 1000); // 3 requests per 60 seconds

router.post('/', pollLimiter, createPollHandler);
router.get('/active', getActivePollHandler);
router.get('/history', getPollHistoryHandler);
router.post('/:id/start', startPollHandler);
router.post('/:id/end', endPollHandler);
router.get('/participants', getParticipantsHandler);

export default router;
