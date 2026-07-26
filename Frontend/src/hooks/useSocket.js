import { useEffect } from 'react';
import socket from '../socket/socket';
import useAuthStore from '../store/authStore';

function useSocket(roomCode, handlers = {}) {
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    useEffect(() => {
        if (!roomCode || !token || !isAuthenticated) return;

        socket.auth = { token };
        socket.connect();
        socket.on('connect_error', (err) => {
            console.log('Socket connect error:', err.message);
        });


        socket.emit('join_room', roomCode);

        Object.entries(handlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
            socket.disconnect();
        };
    }, [roomCode, token,isAuthenticated]);

    return socket;
}

export default useSocket;