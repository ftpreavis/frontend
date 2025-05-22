<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, nextTick, watch } from 'vue'
import { useAuth } from "@/store/auth"
import { useChat } from "@/store/chat"
import { useRoute } from "vue-router"
import { useSocket } from '@/sockets/socket'
import { scrollContainer as sharedScrollRef } from '@/store/ui'
import { formatDateLabel } from '@/utils/date'

const authStore = useAuth()
const chatStore = useChat()
const socket = useSocket()
const route = useRoute()

const selectedId = ref<number | null>(null)
const newMessage = ref('')
const scrollContainer = sharedScrollRef
const showScrollButton = ref(false)
const showNewMsgText = ref(false)

const isNearBottom = (): boolean => {
	const el = scrollContainer.value
	if (!el) return true
	return el.scrollTop + el.clientHeight >= el.scrollHeight - 100
}

const handleScroll = () => {
	if (!scrollContainer.value || selectedId.value === null) return
	const atBottom = isNearBottom()

	showScrollButton.value = !atBottom
	showNewMsgText.value = !atBottom && (chatStore.unread[selectedId.value] ?? 0) > 0

	if (atBottom && chatStore.unread[selectedId.value] > 0) {
		socket.emit('mark_as_read', { withUserId: selectedId.value })
		chatStore.markAsRead(selectedId.value)
	}
}

watch(() => chatStore.scrollToBottomFlag, async (flag) => {
	if (!flag || selectedId.value === null) return

	await nextTick()
	const el = scrollContainer.value
	if (!el) return

	if (isNearBottom()) {
		socket.emit('mark_as_read', { withUserId: selectedId.value })
		chatStore.markAsRead(selectedId.value)
		scrollToBottom()
	}
	chatStore.scrollToBottomFlag = false
})

const currentMessages = computed(() =>
	selectedId.value !== null ? chatStore.messages[selectedId.value] ?? [] : []
)

const groupedMessages = computed(() => {
	const groups: Array<{ date: string; messages: typeof currentMessages.value }> = []
	let lastDate = ''

	currentMessages.value.forEach(msg => {
		const msgDate = formatDateLabel(new Date(msg.rawTime))
		if (msgDate !== lastDate) {
			groups.push({ date: msgDate, messages: [] })
			lastDate = msgDate
		}
		groups[groups.length - 1].messages.push(msg)
	})

	return groups
})

const convs = computed(() =>
	chatStore.conversations.map(conv => {
		const user = authStore.userMap[conv.userId]
		return {
			id: conv.userId,
			name: user?.username ?? 'Unknown',
			avatar: user?.avatar ?? '',
			lastMessage: conv.lastMessage,
			lastDate: conv.lastDate,
			unreadCount: chatStore.unread[conv.userId] ?? 0
		}
	})
)

onMounted(async () => {
	if (!authStore.userId) return
	chatStore.setSelectedUser(null)

	const queryTarget = Number(route.query.userId)
	if (queryTarget && !isNaN(queryTarget)) {
		await selectConversation(queryTarget)
	}
})

onUnmounted(() => {
	chatStore.setSelectedUser(null)
})

watch(() => currentMessages.value.length, async () => {
	await nextTick()
	handleScroll()
})

const scrollToBottom = () => {
	const el = scrollContainer.value
	if (el) {
		el.scrollTop = el.scrollHeight
		showScrollButton.value = false
		showNewMsgText.value = false
	}
}

const selectConversation = async (id: number) => {
	selectedId.value = id
	chatStore.setSelectedUser(id)
	await chatStore.fetchMessagesWith(id)
	socket.emit('mark_as_read', { withUserId: id })
	chatStore.markAsRead(id)
	await nextTick()
	scrollToBottom()
}

const onSendMessage = () => {
	if (!newMessage.value.trim() || selectedId.value === null) return

	socket.emit('send_message', {
		toUserId: selectedId.value,
		content: newMessage.value.trim()
	})

	newMessage.value = ''
	nextTick(scrollToBottom)
}
</script>

<template>
	<div class="flex h-full overflow-hidden">
		<aside class="w-full md:w-1/3 border-r border-gray-200 bg-white p-4"
			:class="selectedId !== null ? 'hidden md:block' : ''">
			<h2 class="text-lg font-semibold mb-4">Conversations</h2>
			<div v-if="convs.length === 0">Pas encore de discussion par ici...</div>
			<ul class="space-y-2">
				<li v-for="conv in convs" :key="conv.id" @click="selectConversation(conv.id)" :class="[
					'flex items-start p-3 rounded-lg cursor-pointer hover:bg-gray-100',
					selectedId === conv.id ? 'bg-gray-200' : 'bg-gray-50',
				]">
					<img :src="conv.avatar" alt="avatar" class="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-end">
							<span class="font-medium text-gray-900">{{ conv.name }}</span>
							<span v-if="conv.unreadCount > 0"
								class="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
								{{ conv.unreadCount }}
							</span>
						</div>
						<p class="text-sm text-gray-600 truncate">{{ conv.lastMessage }}</p>
					</div>
				</li>
			</ul>
		</aside>

		<section v-if="selectedId !== null" class="flex flex-col flex-1">
			<button class="md:hidden p-2 text-sm" @click="selectedId = null">← Back</button>

			<!-- Header -->
			<div class="bg-white border-b border-gray-200 p-4 flex flex-col items-center">
				<img :src="convs.find(c => c.id === selectedId)?.avatar" alt="avatar"
					class="w-10 h-10 rounded-full flex-shrink-0" />
				<h3 class="text-md font-semibold mt-1">{{convs.find(c => c.id === selectedId)?.name}}</h3>
			</div>

			<!-- Message Feed (scrollable) -->
			<div ref="scrollContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-6" @scroll="handleScroll">
				<div v-for="(group, index) in groupedMessages" :key="index">
					<!-- Date Separator -->
					<div class="text-center text-xs text-gray-500 mb-2">
						{{ group.date }}
					</div>

					<!-- Messages in Group -->
					<div class="space-y-4">
						<div v-for="msg in group.messages" :key="msg.id"
							:class="msg.senderId === authStore.userId ? 'flex justify-end' : 'flex justify-start'">
							<!-- If received -->
							<template v-if="msg.senderId !== authStore.userId">
								<div class="p-2 rounded max-w-xs bg-white text-gray-800">
									{{ msg.content }}
								</div>
								<div class="text-xs text-gray-400 self-end ml-1">
									{{ msg.time }}
								</div>
							</template>

							<!-- If sent -->
							<template v-else>
								<div class="text-xs text-gray-400 self-end mr-1">
									{{ msg.time }}
								</div>
								<div class="p-2 rounded max-w-xs bg-blue-500 text-white">
									{{ msg.content }}
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>

			<!-- Input -->
			<button v-if="showScrollButton && currentMessages.length > 0" @click="scrollToBottom"
				class="fixed bottom-24 right-6 z-10 bg-blue-500 text-white px-3 py-2 rounded-full shadow-md hover:bg-blue-600 flex items-center space-x-2 transition">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
					stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
				<span v-if="showNewMsgText">New messages</span>
			</button>
			<div class="p-4 bg-white border-t border-gray-200 flex items-center">
				<input v-model="newMessage" type="text" @keyup.enter="onSendMessage" placeholder="Type a message..."
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring" />
				<button @click="onSendMessage" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
					Send
				</button>
			</div>
		</section>
	</div>
</template>
