import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuth } from '@/store/auth'
import axios from 'axios'
import { useChatUI } from './chat_ui'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import ChatToast from '@/components/ChatToast.vue'
import { useRouter } from 'vue-router'

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
	const router = useRouter()

	const authStore = useAuth()
	const chatUIStore = useChatUI()

	function receiveMessage(message: {
		id: number
		senderId: number
		receiverId: number
		content: string
		createdAt: string
	}) {
		const fromId = message.senderId
		const isCurrentChatOpen = selectedUserId.value === fromId

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
		updateUnread(fromId, 1)
		if (isCurrentChatOpen)
			chatUIStore.updateScrollIndicators()
		else {
			const openConversation = async () => {
				if (router.currentRoute.value.name === 'ChatPage') {
					setSelectedUser(fromId)
				} else {
					await router.push({ name: 'ChatPage', query: { userId: fromId } })
				}
			}

			toast(ChatToast, {
				type: 'default',
				position: 'top-right',
				autoClose: 3000,
				expandCustomProps: true,
				theme: 'colored',
				onClick: openConversation, // ⬅️ Click-to-open behavior
				contentProps: {
					title: authStore.userMap[fromId]?.username ?? 'Unknown',
					avatar: `/api/users/${fromId}/avatar`,
					message: msg.content.length > 30 ? msg.content.slice(0, 30) + '…' : msg.content,
				},
			})
		}
	}

	function updateConversationPreview(userId: number, content: string, createdAt: string) {
		let convo = conversations.value.find(c => c.userId === userId)
		let user = authStore.userMap[userId]

		if (!user) return // should already be preloaded

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
		}
	}

	function setSelectedUser(userId: number | null) {
		selectedUserId.value = userId
	}

	function updateUnread(userId: number, count: number) {
		unread.value[userId] = (unread.value[userId] ?? 0) + count;
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

			for (const conv of data) {
				authStore.userMap[conv.userId] = {
					id: conv.userId,
					username: conv.username,
					avatar: conv.avatar
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
			console.error('Failed to load unread counts:', err)
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
			const formatted: Message[] = data.map((m: any) => ({
				id: m.id,
				senderId: m.senderId,
				content: m.content,
				time: new Date(m.createdAt).toLocaleTimeString('default', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}),
				rawTime: m.createdAt
			}))
			messages.value[userId] = formatted
		} catch (err) {
			console.error('Failed to fetch messages:', err)
		}
	}

	async function checkUserBlockStatus(toUserId: number): Promise<{ allowed: boolean, reason?: string }> {
		const userId = authStore.userId
		const token = authStore.token

		try {
			// Check if the target has blocked me
			const res1 = await axios.get('/api/chat/block', {
				params: { userId: toUserId },
				headers: { Authorization: `Bearer ${token}` },
			})
			const blockedMe = res1.data.some((u: any) => u.id === userId)
			if (blockedMe) {
				return { allowed: false, reason: "This user has blocked you." }
			}

			// Check if I have blocked the target
			const res2 = await axios.get('/api/chat/block', {
				params: { userId },
				headers: { Authorization: `Bearer ${token}` },
			})
			const iBlockedThem = res2.data.some((u: any) => u.id === toUserId)
			if (iBlockedThem) {
				return { allowed: false, reason: "You have blocked this user." }
			}

			return { allowed: true }
		} catch (err) {
			console.error('Failed to check message permission', err)
			return { allowed: false, reason: "Could not verify message permissions." }
		}
	}

	return {
		messages,
		unread,
		conversations,
		selectedUserId,
		checkUserBlockStatus,
		updateConversationPreview,
		setSelectedUser,
		updateUnread,
		markAsRead,
		loadConversations,
		loadUnread,
		fetchMessagesWith,
		receiveMessage
	}
})
