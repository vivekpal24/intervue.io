import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';
import voteRoutes from './routes/voteRoutes';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.use('/poll', pollRoutes);
app.use('/vote', voteRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

export default app;
