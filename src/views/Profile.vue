<script setup lang="ts">
import { onMounted, computed, ref, watch } from "vue";
;import { useRoute, useRouter } from "vue-router"
import axios from "axios";
import { useAuth } from "@/store/auth";
import {useFriends} from "@/store/friends.ts";
import {useProfileManagement} from "@/store/profileManagement.ts";
import { useLang } from "@/composables/useLang"
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'

import EditProfile from "@/components/ProfilePage/EditProfile.vue"
import FriendsList from "@/components/ProfilePage/FriendsList.vue"
import ConfirmDialogModal from '@/components/Modal/ConfirmDialogModal.vue'
import FriendButton from "@/components/ProfilePage/FriendButton.vue"

const { t } = useLang()
const authStore = useAuth()
const friendsStore = useFriends()
const profileStore = useProfileManagement()
const route = useRoute()
const router = useRouter()

const isBlocked = ref(false)
const showConfirm = ref(false)
const showEditProfile = ref(false)
const showFriendsList = ref(false)
const willBlock = ref(true)
const profileUserId = ref(Number(route.params.userId))

const ifFriends = computed(() => {
	return friendsStore.friendsList.some(r => r.id === profileUserId.value)
})

function toggleBlockUser() {
	willBlock.value = !profileStore.isBlocked
	showConfirm.value = true
}

function handleConfirm(confirmed: boolean) {
	showConfirm.value = false
	if (!confirmed) return
	profileStore.toggleBlock(profileUserId.value)
}

function goToChatWithUser(targetUserId: number) {
	router.push({ name: 'ChatPage', query: { userId: targetUserId } })
};

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

async function refreshAllData(id: number) {
	profileUserId.value = id

	await profileStore.loadProfile(id);

	if (!profileStore.isOwner) await profileStore.fetchBlockedStatus(id)

	await Promise.all([
		friendsStore.fetchSentRequests(),
		friendsStore.fetchReceivedRequests(),
		friendsStore.fetchFriendsList()
	])
}

onMounted(() => {
	refreshAllData(profileUserId.value)
});

watch(
	() => route.params.userId,
	(newId) => {
		refreshAllData(Number(newId))
	},
	{ immediate: true }
);

</script>

<template>
	<div v-bind="$attrs">
		<div class="bg-[#F8F6F0] h-full dark:bg-gray-800">
			<div class="flex flex-col dark:text-gray-100 md:w-1/2 m-auto" v-if="profileStore.profileUser">
				<div class="flex flex-col bg-white mt-3 px-8 py-4 dark:bg-gray-700">
					<span class="text-lg font-semibold mb-3">{{ profileStore.profileUser.username }}</span>
					<div class="flex flex-row items-center ">
						<div class="w-[90px] h-[90px] rounded-full bg-cover bg-center bg-no-repeat" v-if="profileStore.profileImage"
							:style="{ backgroundImage: `url(${profileStore.profileImage})` }" />
						<div v-else
							class="w-[90px] h-[90px] rounded-full bg-gray-200 flex items-center justify-center text-sm text-gray-500">
							{{ t('profile.noAvatar') }}
						</div>
						<button class="ml-5 flex flex-col cursor-pointer text-left" @click="showFriendsList = true">
							<span class="font-semibold">{{ profileStore.nbFriends }}</span>
							<span class="text-gray-400 text-sm my-1">{{ t('profile.friends') }}</span>
						</button>
					</div>
					<span class="mt-4 text-sm">{{ profileStore.profileBio }}</span>
					<div class="mt-3 flex flex-row items-center">
						<div class="flex">
							<button v-if="!profileStore.isOwner && ifFriends" @click="goToChatWithUser(profileUserId)"
								class="cursor-pointer border py-2 px-6 rounded-lg transition-all ease-in-out duration-500 hover:border-black">
								<span class="flex items-center gap-2">
									{{ t('profile.sendMessage') }}
									<ChatBubbleLeftEllipsisIcon class="w-5 h-5" />
								</span>
							</button>
<!--							<button v-if="!isOwner"-->
<!--								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black hover:bg-emerald-500 hover:text-white">-->
<!--								<span>{{ t('profile.addFriend') }}</span>-->
<!--							</button>-->
							<FriendButton :profileUserId="profileUserId"></FriendButton>
							<button @click="showEditProfile = true" v-if="profileStore.isOwner"
								class="cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black">
								{{ t('profile.edit') }}
							</button>
<!--							<button v-if="!profileStore.isOwner" @click="toggleBlockUser"-->
<!--								class="ml-2 cursor-pointer border py-2 px-6 rounded-lg bg-red-400 hover:bg-red-500 transition-all ease-in-out duration-500 hover:border-black">-->
<!--								{{ profileStore.isBlocked ? t('profile.unblock') : t('profile.block') }}-->
<!--							</button>-->
						</div>
					</div>
				</div>
				<div class="flex flex-col bg-white mt-3 px-8 py-4 dark:bg-gray-700">
					<span class="mb-2">{{ t('profile.statsTitle') }}</span>
					<hr class="mb-3" />
					<div class="flex flex-row justify-around">
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.win') }}</span>
							<span>{{ profileStore.nbWin }}</span>
						</div>
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.loose') }}</span>
							<span>{{ profileStore.nbLoose }}</span>
						</div>
						<div class="flex flex-col">
							<span class="text-gray-400 text-sm my-1">{{ t('profile.ratio' )}}</span>
							<span>{{ profileStore.nbTotal.toFixed(2) }}</span>
						</div>
					</div>
				</div>
				<div class="flex flex-col bg-white mt-3 px-8 py-4 dark:bg-gray-700">
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
								<tr v-for="game in profileStore.lastGames" :key="game.id" class="border-t">
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
		<EditProfile v-model:visible="showEditProfile" :initial-avatar="profileStore.profileImage || ''"
			:initial-bio="profileStore.profileUser?.biography || ''" :initial-username="profileStore.profileUser?.username || 'No user found'"
			@save-profile="handleSaveProfile" />
		<FriendsList v-model:visible="showFriendsList" />
		<ConfirmDialogModal :visible="showConfirm" :title="willBlock ? t('confirm.blockTitle') : t('confirm.unblockTitle')"
			:message="willBlock ? t('confirm.blockMessage') : t('confirm.unblockMessage')"
			:ok-button="willBlock ? t('confirm.blockOk') : t('confirm.unblockOk')"
			:cancel-button="t('confirm.defaultCancel')" @update:visible="(val) => showConfirm = val"
			@confirm="handleConfirm" />
	</div>
</template>
