<script setup lang="ts">
import {computed, ref} from 'vue'
import {useAuth} from "@/store/auth.ts";

const authStore = useAuth()

const conversations = ref([
	{
		id: 1,
		name: 'Vabaud',
		avatarUrl:
			'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg',
		unreadCount: 2,
		lastMessage: 'Salut mec ca va t chaud demain on va a 42 et apres on va au bar ehe',
	},
	{
		id: 2,
		name: 'Kiwi Cométaire',
		avatarUrl:
			'https://dgalywyr863hv.cloudfront.net/pictures/athletes/5544139/1704405/3/medium.jpg',
		unreadCount: 1,
		lastMessage: "Yo j'ai finis mes modifs sur la branche je vais push et merge sur dev",
	},
	{
		id: 3,
		name: 'OnkelTag',
		avatarUrl:
			'https://dgalywyr863hv.cloudfront.net/pictures/athletes/96346054/26358820/1/medium.jpg',
		unreadCount: 0,
		lastMessage:
			"Faut je finisse le back recuperer les bonnes routes je te dis quand j'ai finis",
	},
])

const allChat = {
	1: [
		{ id: 1, senderId: 2, text: 'Oui mais apres tu vois je sais pas', time: '10:00'},
		{ id: 2, senderId: 2, text: 'Pas lalalalalalal je suis pas la nais enfaite si je suis un nain', time: '10:05'},
		{ id: 3, senderId: 1, text: 'Mais ca va pas bien la tete non mais', time: '11:00'},
		{ id: 4, senderId: 1, text: 'Salut mec ca va t chaud demain on va a 42 et apres on va au bar ehe', time: '12:00'},
	],
	2: [
		{ id: 1, senderId: 2, text: 'tu as push ?', time: '8:00'},
		{ id: 2, senderId: 2, text: 'je suis presque la', time: '9:00'},
		{ id: 3, senderId: 4, text: 'Yo j\'ai finis mes modifs sur la branche je vais push et merge sur dev', time: '12:00'},
	],
	3: [
		{ id: 1, senderId: 2, text: 'tu as push ?', time: '8:00'},
		{ id: 2, senderId: 3, text: 'Faut je finisse le back recuperer les bonnes routes je te dis quand j\'ai finis', time: '12:00'},
	],
}

const selectedId = ref<number | null>(null)

const activeMessage = computed(() => selectedId.value !== null ? allChat[selectedId.value] || [] : [])


const selectConversation = (id: number) => {
	selectedId.value = id

	const conv = conversations.value.find(c => c.id === id)
	if (conv) conv.unreadCount = 0
}
</script>

<template>
	<div class="h-screen flex flex-col md:flex-row">
		<aside
			class="w-full md:w-1/3 border-r border-gray-200 bg-white p-4"
			:class="selectedId !== null ? 'hidden md:block' : ''"
		>
			<h2 class="text-lg font-semibold mb-4">Conversations</h2>
			<ul class="space-y-2">
				<li
					v-for="conv in conversations"
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

		<section v-if="selectedId !== null" class="flex-1 flex flex-col">
			<button class="md:hidden p-2 text-sm" @click="selectedId = null">← Back</button>
			<div class="bg-white border-b border-gray-200 p-4 flex flex-col items-center">
				<img
					:src="conversations.find(c => c.id === selectedId)?.avatarUrl"
					alt="avatar"
					class="w-10 h-10 rounded-full flex-shrink-0"
				/>
				<h3 class="text-md font-semibold mt-1">{{ conversations.find(c => c.id === selectedId)?.name}}</h3>
			</div>
			<div class="flex-1 overflow-auto p-4 bg-gray-50">
				<div class="space-y-4">
					<div v-for="msg in activeMessage" :key="msg.id" class="items-center" :class="msg.senderId === authStore.userId ? 'flex justify-end' : 'flex justify-start'">
						<div class="p-2 rounded" :class="msg.senderId === authStore.userId ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'">
							{{ msg.text }}
						</div>
						<div class="text-xs text-gray-400 ml-2 ">{{msg.time}}</div>
					</div>
				</div>
			</div>
			<div class="p-4 bg-white border-t border-gray-200">
				<input
					type="text"
					placeholder="Type a message..."
					class="w-full px-4 py-2 border rounded focus:outline-none focus:ring"
				/>
			</div>
		</section>
	</div>
</template>
