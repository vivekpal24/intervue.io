import { Router } from 'express';
import { submitVoteHandler } from '../controllers/voteController';
import { createRateLimiter } from '../middlewares/rateLimiter';

const router = Router();
const voteLimiter = createRateLimiter(5, 10 * 1000); // 5 requests per 10 seconds

router.post('/', voteLimiter, submitVoteHandler);

export default router;
