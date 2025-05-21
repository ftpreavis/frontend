<script setup lang="ts">
import { onMounted, computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Header from "@/components/Header.vue";
import EditProfile from "@/components/EditProfile.vue";
import FriendsList from "@/components/FriendsList.vue";
import { useAuth } from "../store/auth.ts";

const showEditProfile = ref(false)
const showFriendsList = ref(false)

const authStore = useAuth()
const route = useRoute()

const profileImage = ref<string | null>(null)

const loadProfile = async (id: number) => {
	await authStore.fetchUserById(id)
	profileImage.value = `http://localhost:4003/users/${id}/avatar`
}

onMounted(() => {
	try {
		loadProfile(Number(route.params.userId))
	} catch {
		console.log('Erreur lors du chargement du profil')
	}
})

watch(
	() => route.params.userId,
	(newId) => {
		try {
			loadProfile(Number(newId))
		} catch {
			console.log('Erreur lors du changement de profil')
		}
	}
)

const isOwner = computed(() =>
	authStore.user?.id === authStore.userId
)
const isFriend = false

const profileBio = computed(() =>
	authStore.user?.biography || "This user hasn’t written a bio yet."
)

const nbWin = computed(() => authStore.user?.stats?.wins ?? 0)
const nbLoose = computed(() => authStore.user?.stats?.losses ?? 0)
const nbTotal = computed(() => {
	const total = nbWin.value + nbLoose.value
	return total > 0 ? (nbWin.value / total) * 100 : 0
})

const lastGames = computed(() => {
	const user = authStore.user
	if (!user) return []

	const allMatches = [
		...(user.MatchesAsPlayer1 ?? []).map(match => ({
			id: match.id,
			opponent: match.player2?.username ?? 'Unknown',
			score: `${match.player1Score}-${match.player2Score}`,
			result: match.player1Score > match.player2Score ? 'Victoire' : 'Défaite',
			game: 'Pong',
			playedAt: new Date(match.playedAt)
		})),
		...(user.MatchesAsPlayer2 ?? []).map(match => ({
			id: match.id,
			opponent: match.player1?.username ?? 'Unknown',
			score: `${match.player2Score}-${match.player1Score}`,
			result: match.player2Score > match.player1Score ? 'Victoire' : 'Défaite',
			game: 'Pong',
			playedAt: new Date(match.playedAt)
		}))
	]

	return allMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, 5)
})

const nbFriends = computed(() => {
	const user = authStore.user
	if (!user) return 0

	const sent = user.sentRequests?.filter(f => f.status === 'ACCEPTED') ?? []
	const received = user.receivedRequests?.filter(f => f.status === 'ACCEPTED') ?? []

	const all = [...sent, ...received]
	const uniqueIds = new Set(all.map(f =>
		f.userId === user.id ? f.friendId : f.userId
	))
	return uniqueIds.size
})

const handleSaveProfile = ({ avatar, username, bio, password }: { avatar: File | null, username: string, bio: string, password: string }) => {
    axios.patch(`/api/users/${authStore.userId}/avatar`, {
				headers: { Authorization: `Bearer ${authStore.token}` },
                avatar: "/uploads/avatars/default.png"
			})
    axios.patch(`/api/users/${authStore.userId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
        username: username,
        biography: bio,
        password: password
    })
    window.location.reload()
}

</script>

<template>
	<div class="bg-[#F8F6F0] h-screen">
		<Header />
		<div class="flex flex-col" v-if="authStore.user">
			<div class="flex flex-col bg-white mt-3 px-8 py-4">
				<div class="flex items-center">
					<div
						class="w-[90px] h-[90px] rounded-full bg-cover bg-center bg-no-repeat"
						v-if="profileImage"
						:style="{ backgroundImage: `url(${profileImage})` }"
					/>
					<div
						v-else
						class="w-[90px] h-[90px] rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500"
					>
						Aucun avatar
					</div>
					<span class="ml-5 text-lg font-semibold">{{ authStore.user.username }}</span>
				</div>
				<span class="mt-4 text-sm">{{ profileBio }}</span>
				<div class="mt-3 flex flex-row items-center justify-between">
					<button class="flex flex-col cursor-pointer text-left" @click="showFriendsList = true">
						<span class="text-gray-400 text-sm my-1">Friends</span>
						<span class="font-semibold">{{ nbFriends }}</span>
					</button>
					<div class="flex">
						<button
							v-if="!isOwner && isFriend"
							class="cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black mr-2"
						>
							<span>Message</span>
						</button>
						<button
							v-else-if="!isOwner"
							class="cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black mr-2"
						>
							<span>Add to friend</span>
						</button>
						<button
							@click="showEditProfile = true"
							v-if="isOwner"
							class="cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black"
						>
							Edit profile
						</button>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-white mt-3 px-8 py-4">
				<span class="mb-2">Stats for all game</span>
				<hr class="mb-3" />
				<div class="flex flex-row justify-around">
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Win</span>
						<span>{{ nbWin }}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Loose</span>
						<span>{{ nbLoose }}</span>
					</div>
					<div class="flex flex-col">
						<span class="text-gray-400 text-sm my-1">Ratio</span>
						<span>{{ nbTotal.toFixed(2) }}</span>
					</div>
				</div>
			</div>
			<div class="flex flex-col bg-white mt-3 px-8 py-4">
				<span class="mb-2">Your recent game</span>
				<hr class="mb-3" />
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
							<td
								class="px-4 py-3 text-center text-sm"
								:class="game.result === 'Victoire' ? 'text-green-600' : 'text-red-600'"
							>
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
	<EditProfile v-model:visible="showEditProfile" :initialAvatar="'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'" :initial-bio="authStore.user?.biography || 'This user hasn’t written a bio yet.'" :initial-username="authStore.user?.username" @save-profile="handleSaveProfile"/>
	<FriendsList v-model:visible="showFriendsList" />
</template>
