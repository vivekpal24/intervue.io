import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketWrapper {
    private socket: Socket | null = null;

    connect(pollId: string, studentName?: string) {
        if (this.socket) {
            this.disconnect();
        }

        const query: Record<string, string> = { pollId };
        if (studentName) query.studentName = studentName;

        this.socket = io(SOCKET_URL, {
            query,
            autoConnect: true,
            reconnection: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to polling socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from polling socket server');
        });

        this.socket.on('error', (err: any) => {
            console.error('Socket error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

export const socketWrapper = new SocketWrapper();
