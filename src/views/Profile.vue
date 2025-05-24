<script setup lang="ts">
/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import { onMounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Header from "@/components/Header.vue";
import EditProfile from "@/components/EditProfile.vue";
import FriendsList from "@/components/FriendsList.vue";
import { useAuth } from "@/store/auth";
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { useLang } from "@/composables/useLang"

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const isBlocked = ref(false);
const showConfirm = ref(false);
const showEditProfile = ref(false);
const showFriendsList = ref(false);
const willBlock = ref(true);
const authStore = useAuth();
const route = useRoute();
const router = useRouter();
const { t } = useLang();
const profileImage = ref<string | null>(null);
const profileUser = ref<any | null>(null);

/* -------------------------------------------------------------------------- */
/*                                  Functions                                 */
/* -------------------------------------------------------------------------- */

const handleConfirm = async (confirmed: boolean) => {
	showConfirm.value = false
	if (!confirmed || !profileUser.value) return

	const url = '/api/chat/block'
	const method = willBlock.value ? 'post' : 'delete'
	const body = {
		blockerId: authStore.userId,
		blockedId: profileUser.value.id,
	}

	try {
		await axios({
			method,
			url,
			data: body,
			headers: { Authorization: `Bearer ${authStore.token}` },
		})
		isBlocked.value = willBlock.value
	} catch (err) {
		console.error('Failed to toggle block status', err)
	}
}

const loadProfile = async (id: number) => {
	const data = await authStore.fetchUserById(id);
	if (data) {
		profileUser.value = data;
		profileImage.value = `/api/users/${id}/avatar`;
	}
};

async function toggleBlockUser() {
	willBlock.value = !isBlocked.value
	showConfirm.value = true
}

onMounted(async () => {
	loadProfile(Number(route.params.userId));
	if (!isOwner.value) {
		try {
			const res = await axios.get(`/api/chat/block`, {
				params: { userId: authStore.userId },
				headers: { Authorization: `Bearer ${authStore.token}` },
			})
			console.log("Blocked users :", res.data);
			isBlocked.value = res.data.some((user: any) => user.id === profileUser.value?.id)
		} catch (err) {
			console.error('Error fetching blocked users:', err)
		}
	}
});

watch(
	() => route.params.userId,
	(newId) => {
		loadProfile(Number(newId));
	}
);

function goToChatWithUser(targetUserId: number) {
	router.push({ name: 'ChatPage', query: { userId: targetUserId } })
};

const isOwner = computed(() => profileUser.value?.id === authStore.userId);
const isFriend = false;

const profileBio = computed(() =>
	profileUser.value?.biography || t('profile.noBio')
);

const nbWin = computed(() => profileUser.value?.stats?.wins ?? 0);
const nbLoose = computed(() => profileUser.value?.stats?.losses ?? 0);
const nbTotal = computed(() => {
	const total = nbWin.value + nbLoose.value;
	return total > 0 ? (nbWin.value / total) * 100 : 0;
});

const lastGames = computed(() => {
	const user = profileUser.value;
	if (!user) return [];

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
	];

	return allMatches.sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, 5);
});

const nbFriends = computed(() => {
	const user = profileUser.value;
	if (!user) return 0;

	const sent = user.sentRequests?.filter(f => f.status === 'ACCEPTED') ?? [];
	const received = user.receivedRequests?.filter(f => f.status === 'ACCEPTED') ?? [];

	const all = [...sent, ...received];
	const uniqueIds = new Set(all.map(f =>
		f.userId === user.id ? f.friendId : f.userId
	));
	return uniqueIds.size;
});

const handleSaveProfile = ({ avatar, username, bio, password }: { avatar: File | null, username: string, bio: string, password: string }) => {
	axios.patch(`/api/users/${authStore.userId}/avatar`, {
		headers: { Authorization: `Bearer ${authStore.token}` },
		avatar: "/uploads/avatars/default.png"
	});
	axios.patch(`/api/users/${authStore.userId}`, {
		headers: { Authorization: `Bearer ${authStore.token}` },
		username: username,
		biography: bio,
		password: password
	});
	window.location.reload();
};
</script>

<template>
	<div v-bind="$attrs">
		<div class="bg-[#F8F6F0] h-full">
			<div class="flex flex-col" v-if="profileUser">
				<div class="flex flex-col bg-white mt-3 px-8 py-4">
					<div class="flex items-center">
						<div class="w-[90px] h-[90px] rounded-full bg-cover bg-center bg-no-repeat" v-if="profileImage"
							:style="{ backgroundImage: `url(${profileImage})` }" />
						<div v-else
							class="w-[90px] h-[90px] rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
							{{ t('profile.noAvatar') }}
						</div>
						<span class="ml-5 text-lg font-semibold">{{ profileUser.username }}</span>
					</div>
					<span class="mt-4 text-sm">{{ profileBio }}</span>
					<div class="mt-3 flex flex-row items-center justify-between">
						<button class="flex flex-col cursor-pointer text-left" @click="showFriendsList = true">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.friends') }}</span>
							<span class="font-semibold">{{ nbFriends }}</span>
						</button>
						<div class="flex">
							<button v-if="!isOwner" @click="goToChatWithUser(profileUser.id)"
								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg transition-all ease-in-out duration-500 hover:border-black">
								<span class="flex items-center gap-2">
									{{ t('profile.sendMessage') }}
									<ChatBubbleLeftEllipsisIcon class="w-5 h-5" />
								</span>
							</button>
							<button v-if="!isOwner"
								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black hover:bg-emerald-500 hover:text-white">
								<span>{{ t('profile.addFriend') }}</span>
							</button>
							<button @click="showEditProfile = true" v-if="isOwner"
								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black">
								{{ t('profile.edit') }}
							</button>
							<button v-if="!isOwner" @click="toggleBlockUser"
								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg bg-red-400 hover:bg-red-500 transition-all ease-in-out duration-500 hover:border-black">
								{{ isBlocked ? t('profile.unblock') : t('profile.block') }}
							</button>
						</div>
					</div>
				</div>
				<div class="flex flex-col bg-white mt-3 px-8 py-4">
					<span class="mb-2">{{ t('profile.statsTitle') }}</span>
					<hr class="mb-3" />
					<div class="flex flex-row justify-around">
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.win') }}</span>
							<span>{{ nbWin }}</span>
						</div>
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.loose') }}</span>
							<span>{{ nbLoose }}</span>
						</div>
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.ratio' )}}</span>
							<span>{{ nbTotal.toFixed(2) }}</span>
						</div>
					</div>
				</div>
				<div class="flex flex-col bg-white mt-3 px-8 py-4">
					<span class="mb-2">{{ t('profile.recentGames') }}</span>
					<hr class="mb-3" />
					<div class="overflow-x-auto">
						<table class="min-w-full bg-white rounded-lg overflow-hidden">
							<thead class="bg-gray-100">
								<tr>
									<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">{{
										t('profile.table.game') }}</th>
									<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">{{
										t('profile.table.name') }}</th>
									<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">{{
										t('profile.table.score') }}</th>
									<th class="px-4 py-2 text-center text-sm font-medium text-gray-600">{{
										t('profile.table.result') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="game in lastGames" :key="game.id" class="border-t">
									<td class="px-4 py-3 text-sm text-gray-700">{{ game.game }}</td>
									<td class="px-4 py-3 text-sm text-gray-700">{{ game.opponent }}</td>
									<td class="px-4 py-3 text-center text-sm text-gray-700">{{ game.score }}</td>
									<td class="px-4 py-3 text-center text-sm"
										:class="game.result === 'Victoire' ? 'text-green-600' : 'text-red-600'">
										{{ game.result === 'Victoire' ? t('profile.table.win') : t('profile.table.loss')
										}}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div v-else>
				{{ t('profile.notFound') }}
			</div>
		</div>
		<EditProfile v-model:visible="showEditProfile" :initial-avatar="profileImage || ''"
			:initial-bio="profileUser?.biography || ''" :initial-username="profileUser?.username || 'No user found'"
			@save-profile="handleSaveProfile" />
		<FriendsList v-model:visible="showFriendsList" />
		<ConfirmDialog :visible="showConfirm" :title="willBlock ? t('confirm.blockTitle') : t('confirm.unblockTitle')"
			:message="willBlock ? t('confirm.blockMessage') : t('confirm.unblockMessage')"
			:ok-button="willBlock ? t('confirm.blockOk') : t('confirm.unblockOk')"
			:cancel-button="t('confirm.defaultCancel')" @update:visible="(val) => showConfirm = val"
			@confirm="handleConfirm" />
	</div>
</template>
