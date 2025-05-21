import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from '@/store/auth'
import axios from 'axios'

interface Message {
	id: number
	senderId: number
	content: string
	time: string
	rawTime: string
}

interface ConversationPreview {
	userId: number
	username: string
	avatar: string
	lastMessage: string
	lastDate: string
}

export const useChat = defineStore('chat', () => {
	const messages = ref<Record<number, Message[]>>({})
	const unread = ref<Record<number, number>>({})
	const conversations = ref<ConversationPreview[]>([])
	const selectedUserId = ref<number | null>(null)
	const authStore = useAuth()

	function handleIncomingMessage(message: {
		id: number
		senderId: number
		receiverId: number
		content: string
		createdAt: string
	}) {
		const fromId = message.senderId
		const msg: Message = {
			id: message.id,
			senderId: message.senderId,
			content: message.content,
			time: new Date(message.createdAt).toLocaleTimeString('default', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			}),
			rawTime: message.createdAt
		}

		if (!messages.value[fromId]) messages.value[fromId] = []
		messages.value[fromId].push(msg)

		updateConversationPreview(fromId, message.content, message.createdAt)

		if (selectedUserId.value !== fromId) {
			unread.value[fromId] = (unread.value[fromId] || 0) + 1
		} else {
			unread.value[fromId] = 0
		}
	}

	async function updateConversationPreview(userId: number, content: string, createdAt: string) {
		let convo = conversations.value.find(c => c.userId === userId)

		let user = authStore.userMap[userId]
		if (!user) {
			user = await authStore.fetchUserById(userId)
			if (!user) return // ⛔ don't proceed if still not found
		}

		if (!convo) {
			convo = {
				userId,
				username: user.username,
				avatar: user.avatar || '/default.png',
				lastMessage: content,
				lastDate: createdAt
			}
			conversations.value.unshift(convo)
		} else {
			convo.lastMessage = content
			convo.lastDate = createdAt
			convo.username = user.username
			convo.avatar = user.avatar || '/default.png'
		}
	}

	function setSelectedUser(userId: number | null) {
		selectedUserId.value = userId
	}

	function loadMessages(userId: number, msgs: Message[]) {
		messages.value[userId] = msgs
	}

	function updateUnread(userId: number, count: number) {
		unread.value[userId] = unread.value[userId] ? unread.value[userId] + count : count
	}

	function markAsRead(userId: number) {
		unread.value[userId] = 0
	}

	function setConversations(raw: Array<{
		id: number
		userId: number
		content: string
		createdAt: string
		username: string
		avatar: string
	}>) {
		conversations.value = raw.map(c => ({
			userId: c.userId,
			username: c.username,
			avatar: c.avatar || '/default.png',
			lastMessage: c.content,
			lastDate: c.createdAt
		}))
	}

	async function loadConversations(userId: number) {
		try {
			const { data } = await axios.get(`/api/chat/conversations`, {
				params: { userId }
			})
			setConversations(data)
			// Preload user data into userMap
			for (const conv of data) {
				if (!authStore.userMap[conv.userId]) {
					authStore.userMap[conv.userId] = {
						id: conv.userId,
						username: conv.username,
						avatar: conv.avatar
					}
				}
			}
		} catch (err) {
			console.error('Failed to load conversations:', err)
		}
	}

	async function loadUnread(userId: number) {
		try {
			const { data } = await axios.get(`/api/chat/messages/unread/by-conversation`, {
				params: { userId }
			})
			for (const entry of data) {
				unread.value[entry.fromUserId] = entry.count
			}
		} catch (err) {
			console.error('Failed to load unread:', err)
		}
	}

	async function fetchMessagesWith(userId: number) {
		try {
			const { data } = await axios.get(`/api/chat/messages/${userId}`, {
				params: {
					userId: authStore.userId,
					take: 1,
					skip: 0
				}
			})
			const formatted = data.map((m: any) => ({
				id: m.id,
				senderId: m.senderId,
				content: m.content,
				time: new Date(m.createdAt).toLocaleTimeString('default', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				})
			}))
			messages.value[userId] = formatted
		} catch (err) {
			console.error('Failed to fetch messages:', err)
		}
	}

	function pushMessage(userId: number, msg: Message) {
		if (!messages.value[userId]) messages.value[userId] = []
		messages.value[userId].push(msg)

		updateConversationPreview(userId, msg.content, new Date().toISOString())
	}

	return {
		messages,
		unread,
		conversations,
		selectedUserId,
		setSelectedUser,
		handleIncomingMessage,
		updateUnread,
		markAsRead,
		loadMessages,
		setConversations,
		updateConversationPreview,
		loadConversations,
		loadUnread,
		fetchMessagesWith,
		pushMessage
	}
})
