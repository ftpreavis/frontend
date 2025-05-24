import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useChat } from '@/store/chat'
import { useSocket } from '@/sockets/socket'

export const useChatUI = defineStore('chat_ui', () => {
	const scrollContainer = ref<HTMLElement | null>(null)
	const isAtBottom = ref(true)
	const showScrollButton = ref(false)
	const showNewMsgText = ref(false)
	const shouldAutoScroll = ref(false)

	const chatStore = useChat()
	const socket = useSocket()

	function updateScrollIndicators() {
		const el = scrollContainer.value
		const userId = chatStore.selectedUserId
		if (!el || userId === null) return

		const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50
		isAtBottom.value = atBottom

		const unread = chatStore.unread[userId] ?? 0
		showScrollButton.value = !atBottom
		showNewMsgText.value = !atBottom && unread > 0

		if (isAtBottom.value && unread > 0) {
			socket.emit('mark_as_read', { withUserId: userId })
			chatStore.markAsRead(userId)
		}

		shouldAutoScroll.value = atBottom;
	}

	function updateShowNewMsgHint() {
		const userId = chatStore.selectedUserId
		if (userId === null) return

		const unread = chatStore.unread[userId] ?? 0
		showNewMsgText.value = !isAtBottom.value && unread > 0
	}

	function checkAutoScroll()
	{
		if (shouldAutoScroll.value) {
			scrollToBottom()
			shouldAutoScroll.value = false
		}
	}

	function scrollToBottom() {
		const el = scrollContainer.value
		if (el) {
			el.scrollTop = el.scrollHeight
			showScrollButton.value = false
			showNewMsgText.value = false
		}
	}

	function attachScroll() {
		const el = scrollContainer.value
		if (!el) return
		el.addEventListener('scroll', updateScrollIndicators)
		updateScrollIndicators()
	}

	function detachScroll() {
		const el = scrollContainer.value
		if (!el) return
		el.removeEventListener('scroll', updateScrollIndicators)
	}

	return {
		scrollContainer,
		isAtBottom,
		showScrollButton,
		showNewMsgText,
		updateScrollIndicators,
		updateShowNewMsgHint,
		checkAutoScroll,
		scrollToBottom,
		attachScroll,
		detachScroll
	}
})
