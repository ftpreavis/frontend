<script setup lang="ts">

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/store/auth';
import { useChat } from '@/store/chat';
import { useSocket } from '@/sockets/socket';
import { useChatUI } from '@/store/chat_ui';
import { formatDateLabel } from '@/utils/date';
import type { ComponentPublicInstance } from 'vue';
import OnlineStatusDot from '@/components/OnlineStatusDot.vue';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import UserSearchBar from '@/components/UserSearchBar.vue';

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const authStore = useAuth()
const chatStore = useChat()
const socket = useSocket()
const route = useRoute()
const router = useRouter()
const chatUIStore = useChatUI()

const selectedId = ref<number | null>(null)
const newMessage = ref('')
const chatSearchRef = ref<InstanceType<typeof UserSearchBar> | null>(null)

/* -------------------------------------------------------------------------- */
/*                                   Binding                                  */
/* -------------------------------------------------------------------------- */

function bindScrollContainer(el: Element | ComponentPublicInstance | null) {
	if (el instanceof HTMLElement) {
		chatUIStore.scrollContainer = el
	} else {
		chatUIStore.scrollContainer = null
	}
}

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
			avatar: `/api/users/${conv.userId}/avatar`,
			lastMessage: conv.lastMessage,
			lastDate: conv.lastDate,
			unreadCount: chatStore.unread[conv.userId] ?? 0
		}
	})
)

/* -------------------------------------------------------------------------- */
/*                                  Functions                                 */
/* -------------------------------------------------------------------------- */

function goToProfile(targetUserId: number) {
	router.push({ name: 'Profile', params: { userId: targetUserId } })
};

const selectConversation = async (id: number) => {
	if (id == authStore.userId) return window.location.reload() ;
	chatUIStore.detachScroll()
	selectedId.value = id
	chatStore.setSelectedUser(id)

	if (!authStore.userMap[id]) {
		const data = await authStore.fetchUserById(id)
		if (data) {
			authStore.userMap[id] = {
				id: data.id,
				username: data.username,
				avatar: data.avatar
			}
		}
	}

	await chatStore.fetchMessagesWith(id)
	await nextTick()

	chatUIStore.scrollToBottom()
	chatUIStore.updateScrollIndicators()

	chatUIStore.attachScroll()
}

const onSendMessage = async () => {
	if (!newMessage.value.trim() || selectedId.value === null) return

	const { allowed, reason } = await chatStore.checkUserBlockStatus(selectedId.value)
	if (!allowed) {
		newMessage.value = ''
		toast.error(`${reason}`, {
			position: 'top-right',
			autoClose: 3000,
			pauseOnHover: true,
			theme: 'light'
		});
		return
	}

	// ✅ Continue as normal
	const content = newMessage.value.trim()
	const now = new Date()

	const msg = {
		id: Date.now(),
		senderId: authStore.userId!,
		content,
		time: now.toLocaleTimeString('default', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		}),
		rawTime: now.toISOString()
	}

	if (!chatStore.messages[selectedId.value])
		chatStore.messages[selectedId.value] = []

	chatStore.messages[selectedId.value].push(msg)
	chatStore.updateConversationPreview(selectedId.value, content, msg.rawTime)

	socket.emit('send_message', {
		toUserId: selectedId.value,
		content
	})

	newMessage.value = ''
	nextTick(chatUIStore.scrollToBottom)
}

const handleUserSearchSelect = async (user: { id: number; username: string; avatar: string }) => {
	// If the conversation is already known, use it
	if (chatStore.conversations.some(conv => conv.userId === user.id)) {
		await selectConversation(user.id)
	} else {
		// Start a new one
		await chatStore.fetchMessagesWith(user.id)
		selectedId.value = user.id
		chatStore.setSelectedUser(user.id)
		nextTick(() => {
			chatUIStore.scrollToBottom()
			chatUIStore.updateScrollIndicators()
			chatUIStore.attachScroll()
		})
	}
	chatSearchRef.value?.clear();
}

/* -------------------------------------------------------------------------- */
/*                                   Events                                   */
/* -------------------------------------------------------------------------- */

onMounted(async () => {
	if (!authStore.userId) return
	chatStore.setSelectedUser(null)

	const queryTarget = Number(route.query.userId)
	if (queryTarget && !isNaN(queryTarget)) {
		await selectConversation(queryTarget)
		chatUIStore.attachScroll()
	}
})

onUnmounted(() => {
	chatUIStore.detachScroll()
	chatStore.setSelectedUser(null)
})

watch(() => currentMessages.value.length, async () => {
	await nextTick()
	chatUIStore.checkAutoScroll();
})

watch(() => chatStore.selectedUserId, async () => {
	chatStore.selectedUserId !== null ? selectConversation(chatStore.selectedUserId) : null
})
</script>

<template>
	<div class="flex h-full overflow-hidden dark:bg-gray-800">
		<aside class="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-600 dark:bg-gray-800 bg-white p-4 "
			:class="selectedId !== null ? 'hidden md:block' : ''">
			<h2 class="text-lg font-semibold mb-4 dark:text-gray-100">{{ $t('chat.conversations') }}</h2>
			<UserSearchBar ref="chatSearchRef" class="mt-2 mb-4" placeholder="Search users..." @select="handleUserSearchSelect" />
			<div v-if="convs.length === 0" class="dark:text-gray-400">{{ $t('chat.noConversations') }}</div>
			<ul class="space-y-2">
				<li v-for="conv in convs" :key="conv.id" @click="selectConversation(conv.id)" :class="[
					'flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700',
					selectedId === conv.id ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800',
				]">
					<div class="relative">
						<OnlineStatusDot :userId="conv.id" class="mr-2">
							<div class="w-12 h-12 rounded-full overflow-hidden bg-contain bg-center bg-no-repeat"
								:style="{ backgroundImage: `url(${conv.avatar})` }" />
						</OnlineStatusDot>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-center">
							<span class="font-medium text-gray-900 dark:text-white">{{ conv.name }}</span>
							<span v-if="conv.unreadCount > 0"
								class="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
								{{ conv.unreadCount }}
							</span>
						</div>
						<p class="text-sm text-gray-600 dark:text-gray-300 truncate">{{ conv.lastMessage }}</p>
					</div>
				</li>
			</ul>
		</aside>

		<section v-if="selectedId !== null" class="flex flex-col flex-1">
			<button class="md:hidden p-2 text-sm cursor-pointer dark:text-gray-300" @click="selectedId = null">{{
				$t('chat.back') }}</button>

			<div
				class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-500 p-4 flex flex-col items-center">
				<button @click="goToProfile(selectedId)">
					<OnlineStatusDot :userId="selectedId" class="mr-2">
						<div class="w-12 h-12 rounded-full overflow-hidden bg-contain bg-center bg-no-repeat"
							:style="{ backgroundImage: `url(${`/api/users/${selectedId}/avatar`})` }" />
					</OnlineStatusDot>
				</button>
				<h3 class="text-md font-semibold mt-1 dark:text-white">{{ authStore.userMap[selectedId]?.username ?? 'Unknown' }}
				</h3>
			</div>

			<div :ref="bindScrollContainer" class="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-700 space-y-6"
				@scroll="chatUIStore.updateScrollIndicators">
				<div v-for="(group, index) in groupedMessages" :key="index">
					<div class="text-center text-xs text-gray-500 dark:text-gray-300 mb-2">{{ group.date }}</div>
					<div class="space-y-4">
						<div v-for="msg in group.messages" :key="msg.id"
							:class="msg.senderId === authStore.userId ? 'flex justify-end' : 'flex justify-start'">
							<template v-if="msg.senderId !== authStore.userId">
								<div class="p-2 rounded max-w-xs md:max-w-xl bg-white text-gray-800 break-words">
									{{ msg.content }}
								</div>
								<div class="text-xs text-gray-400 self-end ml-1">{{ msg.time }}</div>
							</template>
							<template v-else>
								<div class="text-xs text-gray-400 self-end mr-1">{{ msg.time }}</div>
								<div class="p-2 rounded max-w-xs md:max-w-xl bg-blue-500 text-white break-words">
									{{ msg.content }}
								</div>
							</template>
						</div>
					</div>
				</div>
			</div>

			<button v-if="chatUIStore.showScrollButton && currentMessages.length > 0"
				@click="chatUIStore.scrollToBottom"
				class="fixed bottom-24 right-6 z-10 bg-blue-200 text-gray-500 px-3 py-2 rounded-full shadow-md hover:bg-blue-600 flex items-center space-x-2 transition">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
					stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
				<span v-if="chatUIStore.showNewMsgText">{{ $t('chat.newMessages') }}</span>
			</button>

			<div class="p-4 bg-white dark:bg-gray-800 dark:border-gray-500 border-t border-gray-200 flex items-center">
				<input v-model="newMessage" type="text" @keyup.enter="onSendMessage"
					:placeholder="$t('chat.inputPlaceholder')"
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring dark:bg-gray-700 dark:text-gray-100 dark:border-gray-500" />
				<button @click="onSendMessage" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
					{{ $t('chat.send') }}
				</button>
			</div>
		</section>
	</div>
</template>
