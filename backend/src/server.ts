import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import app from './app';
import { PollSocketHandler } from './socket/pollHandler';
import pollService from './services/pollService';
import connectDB from './config/db';
import { Participant } from './models/Participant';

dotenv.config();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/polling_db';

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

new PollSocketHandler(io);

async function start() {
    await connectDB(mongoUri);

    try {
        await Participant.deleteMany({});
        console.log('Cleared lingering participant records from previous session.');
        await pollService.recoverActivePolls();
    } catch (error) {
        console.error('Failed to run startup routines:', error);
    }

    server.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

start();
