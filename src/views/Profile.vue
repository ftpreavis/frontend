<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
;import { useRoute, useRouter } from "vue-router"
import axios from "axios";
import { useAuth } from "@/store/auth";
import {useFriends} from "@/store/friends.ts";
import {useProfileManagement} from "@/store/profileManagement.ts";
import { useLang } from "@/composables/useLang"
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";
import { InboxArrowDownIcon } from "@heroicons/vue/24/outline";
import {PencilSquareIcon} from "@heroicons/vue/24/outline";
import {LockClosedIcon} from "@heroicons/vue/24/outline";
import {TrashIcon} from "@heroicons/vue/24/outline";

import EditProfile from "@/components/ProfilePage/EditProfile.vue"
import FriendsList from "@/components/ProfilePage/FriendsList.vue"
import OnlineStatusDot from "@/components/OnlineStatusDot.vue";
import ConfirmDialogModal from '@/components/Modal/ConfirmDialogModal.vue'
import FriendButton from "@/components/ProfilePage/FriendButton.vue"
import DropDown from "@/components/DropDown.vue";
import PendingRequestModal from "@/components/Modal/ProfileModal/PendingRequestModal.vue";
import LastConfirmDeleteProfileModal from "@/components/Modal/ProfileModal/LastConfirmDeleteProfileModal.vue";

const { t } = useLang()
const authStore = useAuth()
const friendsStore = useFriends()
const profileStore = useProfileManagement()
const route = useRoute()
const router = useRouter()

const showConfirm = ref(false)
const showEditProfile = ref(false)
const showFriendsList = ref(false)
const showPendingRequest = ref(false)
const showDeleteAccount = ref(false)
const showLastConfirmDeleteAccount = ref(false)
const willBlock = ref(true)
const profileUserId = ref(Number(route.params.userId))
const openBlockedDropDown = ref(false)

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

const handleSaveProfile = async ({ avatar, username, bio, password }: {
	avatar: File | null,
	username: string,
	bio: string,
	password: string
}) => {
	try {
		if (avatar) {
			const formData = new FormData();
			formData.append("file", avatar);

			await axios.patch(`/api/users/${authStore.userId}/avatar`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					Authorization: `Bearer ${authStore.token}`
				},
				withCredentials: true
			});
		}

		await axios.patch(`/api/users/${authStore.userId}`, {
			username: username,
			biography: bio,
			password: password
		}, {
			headers: {
				Authorization: `Bearer ${authStore.token}`
			},
			withCredentials: true
		});

		window.location.reload();
	} catch (err: any) {
		console.error("❌ Échec de la mise à jour :", err.response?.data || err.message);
	}
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
	<div
		v-bind="$attrs"
		class="dark:bg-gray-900 bg-transparent py-8"
	>
		<div v-if="profileStore.profileUser" class="max-w-3xl mx-auto space-y-6 px-4 md:px-0">

			<div
				class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-200"
			>

				<div class="h-2 bg-gradient-to-r from-teal-400 to-blue-500"></div>

				<div
					class="px-4 py-3 border-b border-gray-200 dark:border-gray-600
					 flex flex-col sm:flex-row sm:items-center sm:justify-between"
				>

					<div class="flex flex-col">
						<h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
							{{ profileStore.profileUser.username }}
						</h1>
						<div class="mt-1 h-1 w-16 bg-gradient-to-r from-blue-300 to-teal-500 rounded-full"></div>
					</div>

					<div class="mt-3 sm:mt-0 flex flex-wrap sm:flex-nowrap items-center gap-2">

						<button
							v-if="!profileStore.isOwner"
							@click="goToChatWithUser(profileUserId)"
							class="flex items-center gap-1 sm:gap-2
						 px-3 py-1.5 sm:px-4 sm:py-2
						 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg
						 text-sm sm:text-base
						 shadow-md hover:from-indigo-600 hover:to-purple-600
						 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
						>
							<ChatBubbleLeftEllipsisIcon class="w-4 h-4 sm:w-5 sm:h-5" />
							<span>{{t('profile.sendMessage')}}</span>
						</button>

						<div class="flex-shrink-0">
							<FriendButton
								:profileUserId="profileUserId"
								class="hover:scale-105 transform transition-transform duration-150"
							/>
						</div>

						<button
							v-if="profileStore.isOwner"
							@click="showEditProfile = true"
							class="flex items-center gap-1 sm:gap-2
						 px-3 py-1.5 sm:px-4 sm:py-2
						 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg
						 text-sm sm:text-base
						 shadow-sm hover:from-teal-600 hover:to-blue-600
						 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
						>
							<PencilSquareIcon class="w-4 h-4 sm:w-5 sm:h-5" />
							<span>{{t('profile.edit')}}</span>
						</button>

						<button
							v-if="profileStore.isOwner"
							@click="showPendingRequest = true"
							class="p-2 border border-blue-300 bg-blue-100 dark:bg-gray-700 dark:border-gray-600 rounded-lg text-blue-700 dark:text-gray-200
						 hover:bg-blue-200 dark:hover:bg-gray-600
						 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300
						 flex-shrink-0"
						>
							<InboxArrowDownIcon class="w-5 h-5 sm:w-6 sm:h-6" />
						</button>

						<DropDown v-model="openBlockedDropDown" width-class="w-40">
							<template #trigger>
								<button
									class="p-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white
						   transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-full"
								>
									<EllipsisHorizontalIcon class="w-5 h-5 sm:w-6 sm:h-6" />
								</button>
							</template>
							<template #menu>
								<ul class="py-1">
									<li
										v-if="!profileStore.isOwner"
										@click="toggleBlockUser"
										class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									>
										<LockClosedIcon class="w-5 h-5 text-red-600 mr-2" />
										<span class="text-red-600 dark:text-red-400 text-sm">
							{{ profileStore.isBlocked ? t('profile.unblock') : t('profile.block') }}
						  </span>
									</li>
									<li
										v-else
										@click="showDeleteAccount = true"
										class="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
									>
										<TrashIcon class="w-5 h-5 text-red-600 mr-2" />
										<span class="text-red-600 dark:text-red-400 text-sm">
							{{ t('profile.deleteProfile.trigger') }}
						  </span>
									</li>
								</ul>
							</template>
						</DropDown>
					</div>
				</div>

				<div class="px-6 py-6 flex flex-col md:flex-row md:space-x-6">
					<div class="flex-shrink-0">
						<OnlineStatusDot :userId="profileUserId" v-if="profileStore.profileImage">
							<div class="p-1 bg-gradient-to-tr from-teal-300 to-blue-500 rounded-full">
								<div
									class="w-24 h-24 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-white"
									:style="{ backgroundImage: `url(${profileStore.profileImage})` }"
								/>
							</div>
						</OnlineStatusDot>
						<div
							v-else
							class="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500"
						>
							{{ t('profile.noAvatar') }}
						</div>
					</div>

					<div class="mt-4 md:mt-0 flex-1 flex flex-col justify-between">
						<!-- Bio -->
						<p class="text-gray-700 dark:text-gray-200 italic">
							{{ profileStore.profileBio || t('profile.noBio') }}
						</p>

						<div class="mt-4 flex items-center">
				  <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
					{{ profileStore.nbFriends }}
				  </span>
							<span class="ml-2 text-gray-500 dark:text-gray-400">{{ t('profile.friends') }}</span>
						</div>
					</div>
				</div>
			</div>

			<div
				class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-200"
			>
				<div class="h-1 bg-gradient-to-r from-blue-400 to-teal-400"></div>
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
					<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ t('profile.statsTitle') }}</h2>
				</div>
				<div class="px-6 py-6">
					<div class="grid grid-cols-3 gap-6 text-center">
						<div>
							<div class="text-gray-500 dark:text-gray-400 text-sm">{{ t('profile.win') }}</div>
							<div class="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
								{{ profileStore.nbWin }}
							</div>
						</div>
						<div>
							<div class="text-gray-500 dark:text-gray-400 text-sm">{{ t('profile.loose') }}</div>
							<div class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
								{{ profileStore.nbLoose }}
							</div>
						</div>
						<div>
							<div class="text-gray-500 dark:text-gray-400 text-sm">{{ t('profile.ratio') }}</div>
							<div class="mt-1 text-2xl font-bold text-gray-800 dark:text-gray-200">
								{{ (profileStore.winRatio * 100).toFixed(2) }}%
							</div>
						</div>
					</div>
				</div>
			</div>

			<div
				class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.01] transition-transform duration-200"
			>
				<div class="h-1 bg-gradient-to-r from-teal-300 to-blue-500"></div>
				<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
					<h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ t('profile.recentGames') }}</h2>
				</div>
				<div class="overflow-x-auto px-6 pb-6">
					<table class="min-w-full bg-white dark:bg-gray-800">
						<thead>
						<tr class="bg-gray-100 dark:bg-gray-700">
							<th class="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
								{{ t('profile.table.game') }}
							</th>
							<th class="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
								{{ t('profile.table.name') }}
							</th>
							<th class="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-200">
								{{ t('profile.table.score') }}
							</th>
							<th class="px-4 py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-200">
								{{ t('profile.table.result') }}
							</th>
						</tr>
						</thead>
						<tbody>
						<tr
							v-for="game in profileStore.lastGames"
							:key="game.id"
							class="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
						>
							<td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{{ game.game }}</td>
							<td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">{{ game.opponent }}</td>
							<td class="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-200">{{ game.score }}</td>
							<td
								class="px-4 py-3 text-center text-sm font-semibold"
								:class="game.result === 'Victoire' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
							>
								{{ game.result === 'Victoire' ? t('profile.table.win') : t('profile.table.loss') }}
							</td>
						</tr>
						<tr v-if="!profileStore.lastGames.length">
							<td colspan="4" class="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
								{{ t('profile.noRecentGames') }}
							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>

		</div>
		<div v-if="!profileStore.profileUser" class="text-center text-gray-500 dark:text-gray-400 mt-16">
			{{ t('profile.notFound') }}
		</div>
		<PendingRequestModal v-model="showPendingRequest" />
		<EditProfile
			v-model:visible="showEditProfile"
			:initial-avatar="profileStore.profileImage || ''"
			:initial-bio="profileStore.profileUser?.biography || ''"
			:initial-username="profileStore.profileUser?.username || 'No user found'"
			@save-profile="handleSaveProfile"
		/>
		<FriendsList v-model:visible="showFriendsList" />
		<ConfirmDialogModal
			:visible="showConfirm"
			:title="willBlock ? t('confirm.blockTitle') : t('confirm.unblockTitle')"
			:message="willBlock ? t('confirm.blockMessage') : t('confirm.unblockMessage')"
			:ok-button="willBlock ? t('confirm.blockOk') : t('confirm.unblockOk')"
			:cancel-button="t('confirm.defaultCancel')"
			@update:visible="val => showConfirm = val"
			@confirm="handleConfirm"
		/>
		<ConfirmDialogModal
			:title="t('profile.deleteProfile.firstModal.title')"
			:visible="showDeleteAccount"
			:message="t('profile.deleteProfile.firstModal.body')"
			:ok-button="t('profile.deleteProfile.firstModal.confirmButton')"
			@update:visible="val => showDeleteAccount = val"
			@confirm="() => showLastConfirmDeleteAccount = true"
		/>
		<LastConfirmDeleteProfileModal v-model="showLastConfirmDeleteAccount" />
	</div>
</template>

