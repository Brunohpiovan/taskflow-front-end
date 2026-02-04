import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { STORAGE_KEYS } from './constants';
import { getCookie } from 'cookies-next';

let socket: Socket | null = null;

export const getSocket = () => {
    if (!socket) {
        // Backend URL (root, not /api)
        const url = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

        socket = io(url, {
            autoConnect: false,
            auth: (cb) => {
                const token = getCookie(STORAGE_KEYS.AUTH_TOKEN);
                cb({ token });
            }
        });
    }
    return socket;
};

export const useSocket = (environmentId?: string) => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = getSocket();

        function onConnect() {
            setIsConnected(true);
            if (environmentId) {
                socketInstance.emit('joinEnvironment', environmentId);
            }
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        if (!socketInstance.connected) {
            socketInstance.connect();
        } else {
            setIsConnected(true);
            if (environmentId) {
                socketInstance.emit('joinEnvironment', environmentId);
            }
        }

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        return () => {
            if (environmentId) {
                socketInstance.emit('leaveEnvironment', environmentId);
            }
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
        };
    }, [environmentId]);

    return { socket: getSocket(), isConnected };
};
