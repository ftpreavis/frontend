import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/store/auth';

let socket: Socket;

export function useSocket() {
	if (!socket) {
		const authStore = useAuth();

		const url =
			import.meta.env.DEV
				? 'ws://localhost:4002'
				: '/socket/chat';

		socket = io(url, {
			auth: { userId: authStore.userId },
			autoConnect: false,
			transports: ['websocket'], // force WS, no polling fallback
		});
	}
	return socket;
}
