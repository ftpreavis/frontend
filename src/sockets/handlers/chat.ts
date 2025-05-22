import { useSocket } from '@/sockets/socket'
import { useChat } from '@/store/chat'
import { useAuth } from '@/store/auth'

let isChatSocketSetup = false

export function setupChatSocket() {
	if (isChatSocketSetup) return
	isChatSocketSetup = true
	const socket = useSocket()
	const chatStore = useChat()
	const authStore = useAuth()

	socket.on('connect', async () => {
		if (authStore.userId) {
			await chatStore.loadConversations(authStore.userId)
			await chatStore.loadUnread(authStore.userId)
		}
	})

	socket.on('disconnect', (reason) => {
		console.warn('🔌 Chat socket disconnected:', reason)
	})

	socket.on('connect_error', (err) => {
		console.error('❌ Chat socket error:', err.message)
	})

	socket.on('receive_message', async (message) => {
		const fromId = message.senderId
		const authStore = useAuth()

		if (authStore.userId !== fromId && !authStore.userMap[fromId]) {
			const data = await authStore.fetchUserById(fromId)
			if (!data) return
		}
		chatStore.receiveMessage(message)
	})

	socket.on('notify_unread_count', ({ fromUserId, count }) => {
		chatStore.updateUnread(fromUserId, count)
	})

	socket.on('notify_popup', ({ fromUserId, content }) => {
		const user = authStore.userMap?.[fromUserId]
		const sender = user?.username ?? `User ${fromUserId}`
		console.log(`🔔 Popup from ${sender}: ${content}`)
	})
}
