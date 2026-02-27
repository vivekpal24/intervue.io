import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { socketWrapper } from '../socket/socket';

/**
 * Custom hook managing the singleton connection lifecycle per component.
 * Automatically disconnects or re-renders socket instance securely.
 */
export const useSocket = (pollId?: string, studentName?: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    useEffect(() => {
        if (!pollId) {
            setSocket(null);
            setIsConnected(false);
            return;
        }

        try {
            socketWrapper.connect(pollId, studentName);
            const activeSocket = socketWrapper.getSocket();
            setSocket(activeSocket);

            if (activeSocket) {
                activeSocket.on('connect', () => {
                    setIsConnected(true);
                    setConnectionError(null);
                });

                activeSocket.on('disconnect', () => {
                    setIsConnected(false);
                });

                activeSocket.on('error', (err: { message: string }) => {
                    setConnectionError(err.message || 'Connection failed');
                });

                // If it connects instantly before effect binding
                if (activeSocket.connected) {
                    setIsConnected(true);
                }
            }
        } catch (error: any) {
            setConnectionError(error.message);
        }

        return () => {
            // In simple setups we can disconnect on unmount,
            // but if we are persisting it we rely on the parent logic calling disconnect later.
            socketWrapper.disconnect();
            setSocket(null);
            setIsConnected(false);
        };
    }, [pollId, studentName]);

    return {
        socket,
        isConnected,
        connectionError
    };
};
