import express from 'express';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';
import voteRoutes from './routes/voteRoutes';

const app = express();

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    'https://intervue-io-sand.vercel.app',
    'http://localhost:5173'
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`Origin ${origin} not allowed by CORS`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// Diagnostic middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/poll', pollRoutes);
app.use('/vote', voteRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

export default app;
