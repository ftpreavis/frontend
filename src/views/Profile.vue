<script setup lang="ts">
import {onMounted} from "vue";
import Header from "@/components/Header.vue";
import EditProfile from "@/components/EditProfile.vue";
import FriendsList from "@/components/FriendsList.vue";
import {useRoute} from "vue-router";
import {computed, reactive, ref, watch} from "vue";
import {useAuth} from "../store/auth.ts";

const showEditProfile = ref(false)
const showFriendsList = ref(false)

const authStore = useAuth()
const route = useRoute()

const loadProfile = async (id: number) => await authStore.fetchUserById(id)

onMounted(() => {
	try {
		loadProfile(Number(route.params.userId))
	} catch {
		console.log('ad')
	}
})

watch(
	() => route.params.userId,
	(newId) => {
		try { loadProfile(Number(newId)) } catch {console.log('ad')}
	})

const isOwner = computed(() =>
	authStore.user?.id === authStore.userId
)
const isFriend = false

const profileImage = "https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png"
const nbFriends = 243
const profileBio = "Salut moi c'est Matias"
const nbWin = 32
const nbLoose = 12
const nbTotal = nbWin / nbLoose
const lastGames = reactive([
	{ id: 1, game: 'Pong', opponent: 'John Smith', score: '21-15', result: 'Victoire' },
	{ id: 2, game: 'Pong', opponent: 'Alice Martin', score: '19-21', result: 'Défaite' },
	{ id: 3, game: 'TicTac', opponent: 'Bob Lee', score: '21-18', result: 'Victoire' },
	{ id: 4, game: 'Pong', opponent: 'Clara Zhou', score: '17-21', result: 'Défaite' },
	{ id: 5, game: 'Pong', opponent: 'David Kim', score: '21-19', result: 'Victoire' }
])
</script>

<template>
	<div class="bg-[#F8F6F0] h-screen">
		<Header></Header>
		<div class="flex flex-col" v-if="authStore.user">
			<div class="flex flex-col bg-[#fff] mt-3 px-8 py-4">
				<div class="flex items-center">
					<div class="w-[90px] h-[90px] rounded-full bg-cover" :style="{ backgroundImage: `url(${profileImage})`}">
					</div>
					<span class="ml-5 text-lg font-semibold">{{authStore.user.username}}</span>
				</div>
				<span class="mt-4 text-sm">{{ profileBio }}</span>
				<div class="mt-3 flex flex-row items-center justify-between">
					<button class="flex flex-col cursor-pointer text-left" @click="showFriendsList = true">
						<span class="text-gray-400 text-sm my-1">Friends</span>
						<span class="font-semibold">{{ nbFriends }}</span>
					</button>
					<div class="flex">
						<button v-if="!isOwner && isFriend" class="cursor-pointer border py-2 px-6 rounded-lg
						 hover:rounded-none transition-all ease-in-out duration-500 hover:border-black mr-2">
							<span>Message</span>
						</button>
						<button v-else-if="!isOwner" class="cursor-pointer border py-2 px-6 rounded-lg
						 hover:rounded-none transition-all ease-in-out duration-500 hover:border-black mr-2">
							<span>Add to friend</span>
						</button>
						<button @click="showEditProfile = true" v-if="isOwner" class="cursor-pointer border py-2 px-6 rounded-lg
						 hover:rounded-none transition-all ease-in-out duration-500 hover:border-black">
							Edit profile
						</button>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-[#fff] mt-3 px-8 py-4">
				<span class="mb-2">Stats for all game</span>
				<hr class="mb-3">
				<div class="flex flex-row justify-around">
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Win</span>
						<span>{{nbWin}}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Loose</span>
						<span>{{nbLoose}}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Ratio</span>
						<span>{{nbTotal.toFixed(2)}}</span>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-[#fff] mt-3 px-8 py-4">
				<span class="mb-2">Your recent game</span>
				<hr class="mb-3">
				<div class="overflow-x-auto">
					<table class="min-w-full bg-white rounded-lg overflow-hidden">
						<thead class="bg-gray-100">
							<tr>
								<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Game</th>
								<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Name</th>
								<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Score</th>
								<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">Result</th>
							</tr>
						</thead>
						<tbody>
						<tr v-for="game in lastGames" :key="game.id" class="border-t">
							<td class="px-4 py-3 text-sm text-gray-700">{{ game.game }}</td>
							<td class="px-4 py-3 text-sm text-gray-700">{{ game.opponent }}</td>
							<td class="px-4 py-3 text-center text-sm text-gray-700">{{ game.score }}</td>
							<td class="px-4 py-3 text-center text-sm" :class="game.result === 'Victoire' ? 'text-green-600' : 'text-red-600'">
								{{ game.result }}
							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div v-else>
			Pas user
		</div>
	</div>
	<EditProfile v-model:visible="showEditProfile"></EditProfile>
	<FriendsList v-model:visible="showFriendsList"></FriendsList>
<!--	<div v-if="!authStore.user">Chargemednt</div>-->
<!--	<div v-else><h1>{{authStore.user.username}} fgg</h1> <p>sdf</p></div>-->
</template>
