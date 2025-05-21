<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useAuth} from "@/store/auth.ts";
import {fetchConv, fetchMessages, sendMessage} from "@/services/chatService.ts";
import Header from "@/components/Header.vue";
import axios from "axios";

const authStore = useAuth()

// https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png

const convs = ref<Array<{
	id: number
	name: string
	avatarUrl: string
	lastMessage: string
	lastDate: string
	unreadCount: number
}>>([])

onMounted(async () => {
	if (!authStore.userId) return

	const raw = await fetchConv(authStore.userId)
	const rebuild = await Promise.all(
		raw.map(async c => {
			const user = await authStore.fetchUserById(c.userId)
			return {
				id: c.userId,
				name: user.username,
				avatarUrl: user.avatarUrl,
				lastMessage: c.content,
				lastDate: c.createdAt,
				unreadCount: 0
			}
		})
	)
	convs.value = rebuild
})

const selectedId = ref<number | null>(null)

const messages = ref<Array<{id:number, senderId:number, content:string, time:string}>>([])
const newMessage = ref<string>('')

const selectConversation = async (id: number) => {
	selectedId.value = id

	// const conv = conversations.value.find(c => c.id === id)

	try {
		const raw = await fetchMessages(authStore.userId!, id, 1, 0)
		messages.value = raw.map(m => ({
			id: m.id,
			senderId: m.senderId,
			content: m.content,
			time: new Date(m.createdAt)
				.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false })
		}))
	} catch {
		console.log('Erreur fetchMessages')
	}
}

const onSendMessage = async () => {
	if (selectedId.value === null) return

	try {
		const msg = await sendMessage(
			authStore.userId!,
			selectedId.value,
			newMessage.value.trim()
		)

		messages.value.push({
			id: msg.id,
			senderId: msg.senderId,
			content: msg.content,
			time: new Date(msg.createdAt)
				.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hour12: false })
		})

		newMessage.value = ''
	} catch (err) {
		console.error('Erreur sendMessage', err)
	}
}
</script>

<template>
	<Header></Header>
	<div class="h-screen flex flex-col md:flex-row">
		<aside
			class="w-full md:w-1/3 border-r border-gray-200 bg-white p-4"
			:class="selectedId !== null ? 'hidden md:block' : ''"
		>
			<h2 class="text-lg font-semibold mb-4">Conversations</h2>
			<div v-if="convs.length === 0">Pas encore de discussion par ici...</div>
			<ul class="space-y-2">
				<li
					v-for="conv in convs"
					:key="conv.id"
					@click="selectConversation(conv.id)"
					:class="[
						'flex items-start p-3 rounded-lg cursor-pointer hover:bg-gray-100',
						selectedId === conv.id ? 'bg-gray-200' : 'bg-gray-50',
					]"
				>
					<img
						:src="conv.avatarUrl"
						alt="avatar"
						class="w-10 h-10 rounded-full mr-3 flex-shrink-0"
					/>
					<div class="flex-1 min-w-0">
						<div class="flex justify-between items-end">
							<span class="font-medium text-gray-900">{{ conv.name }}</span>
							<span
								v-if="conv.unreadCount > 0"
								class="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
							>
								{{ conv.unreadCount }}
							</span>
						</div>
						<p class="text-sm text-gray-600 truncate">{{ conv.lastMessage }}</p>
					</div>
				</li>
			</ul>
		</aside>

		<section v-if="selectedId !== null" class="flex-1 flex flex-col min-h-0">
			<button class="md:hidden p-2 text-sm" @click="selectedId = null">← Back</button>
			<div class="bg-white border-b border-gray-200 p-4 flex flex-col items-center">
				<img
					:src="convs.find(c => c.id === selectedId)?.avatarUrl"
					alt="avatar"
					class="w-10 h-10 rounded-full flex-shrink-0"
				/>
				<h3 class="text-md font-semibold mt-1">{{ convs.find(c => c.id === selectedId)?.name}}</h3>
			</div>
			<div class="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
				<div class="space-y-4">
					<div v-for="msg in messages" :key="msg.id" class="items-center" :class="msg.senderId === authStore.userId ? 'flex justify-end' : 'flex justify-start'">
						<div class="p-2 rounded" :class="msg.senderId === authStore.userId ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'">
							{{ msg.content }}
						</div>
						<div class="text-xs text-gray-400 ml-2 ">{{msg.time}}</div>
					</div>
				</div>
			</div>
			<div class="p-4 bg-white border-t border-gray-200 flex items-center">
				<input
					v-model="newMessage"
					type="text"
					@keyup.enter="onSendMessage"
					placeholder="Type a message..."
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
				/>
				<button @click="onSendMessage" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded">Send</button>
			</div>
		</section>
	</div>
</template>
