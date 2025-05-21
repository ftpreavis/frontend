import { useSocket } from '@/sockets/socket'
import { useChat } from '@/store/chat'
import { useAuth } from '@/store/auth'
import { useToast } from 'vue-toastification'

export function setupChatSocket() {
	const socket = useSocket()
	const chatStore = useChat()
	const authStore = useAuth()
	const toast = useToast()

	// Socket connection lifecycle
	socket.on('connect', async () => {
		console.log('✅ Chat socket connected')
		toast.success('Connected to chat')

		if (authStore.userId) {
			// Sync data on connection
			await chatStore.loadConversations(authStore.userId)
			await chatStore.loadUnread(authStore.userId)
		}
	})

	socket.on('disconnect', (reason) => {
		console.warn('🔌 Chat socket disconnected:', reason)
	})

	socket.on('connect_error', (err) => {
		console.error('❌ Chat socket error:', err.message)
		toast.error('Could not connect to chat server')
	})

	// 🔄 Message received
	socket.on('receive_message', (message) => {
		const isCurrentChatOpen = chatStore.selectedUserId === message.senderId;

		// ✅ Case 1: If user is on the conversation → append to chat
		if (isCurrentChatOpen) {
			chatStore.handleIncomingMessage(message);

			// ✅ Case 3: Mark as read immediately
			socket.emit('mark_as_read', { withUserId: message.senderId });
			chatStore.markAsRead(message.senderId); // Local count reset
		} else {
			// ✅ Case 2: Increase unread and update sidebar
			chatStore.updateUnread(message.senderId, 1); // +1 unread
		}

		// ✅ Case 2: Update the left conversation preview
		chatStore.updateConversationPreview(message.senderId, message.content, message.createdAt);
	});

	// 🔔 Unread count update
	socket.on('notify_unread_count', ({ fromUserId, count }) => {
		chatStore.updateUnread(fromUserId, count)
	})

	// 📢 Popup notification
	socket.on('notify_popup', ({ fromUserId, content }) => {
		const user = authStore.userMap?.[fromUserId]
		const sender = user?.username ?? `User ${fromUserId}`
		toast.info(`💬 ${sender}: ${content}`)
	})

	// You can add more events here if needed (e.g. message delivery ack, typing indicators, etc.)
}
