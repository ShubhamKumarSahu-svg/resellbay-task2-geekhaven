import { io } from 'socket.io-client';
import useAppStore from '../stores/useAppStore';

const URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
  'http://localhost:5000';

const socket = io(URL, {
  autoConnect: false,
  auth: (callback) => {
    const token = useAppStore.getState().token;
    callback({ token });
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => console.log('Socket connected:', socket.id));
socket.on('connect_error', (err) =>
  console.error('Socket connection error:', err)
);
socket.on('disconnect', (reason) =>
  console.log('Socket disconnected:', reason)
);

export default socket;
