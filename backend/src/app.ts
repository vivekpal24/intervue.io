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
        if (!origin) return callback(null, true);

        // Normalize origin for comparison
        const normalizedOrigin = origin.replace(/\/$/, '');
        const isAllowed = allowedOrigins.some(ao => ao && ao.replace(/\/$/, '') === normalizedOrigin);

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Origin rejected: ${origin}. Allowed: ${allowedOrigins.join(', ')}`);
            // Avoid throwing a hard error which might break the pipeline; just return false to block
            callback(null, false);
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// Diagnostic middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming: ${req.method} ${req.url} from ${req.headers.origin || 'no-origin'}`);
    next();
});

app.use('/poll', pollRoutes);
app.use('/vote', voteRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Catch-all 404 handler (specifically with CORS context)
app.use((req, res) => {
    console.warn(`[404] No route found for: ${req.method} ${req.url}`);
    res.status(404).json({
        error: 'Resource not found',
        path: req.url,
        method: req.method
    });
});

export default app;
