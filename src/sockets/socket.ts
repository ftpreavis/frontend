import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/store/auth';

let socket: Socket;

export function useSocket() {
	if (!socket) {
		const authStore = useAuth();

		const isDev = process.env.NODE_ENV === 'development';
		const protocol = isDev ? 'ws' : 'wss';
		const host = isDev
			? `${location.hostname}:4002`
			: location.host;

		const url = `${protocol}://${host}`;

		socket = io(url, {
			auth: { userId: authStore.userId },
			autoConnect: false,
			transports: ['websocket'], // force WS, no polling fallback
			path: '/socket/chat'
		});
	}
	return socket;
}
