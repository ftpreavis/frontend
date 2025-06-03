<script setup lang="ts">
import { onMounted, computed, ref, watch } from "vue";
;import { useRoute, useRouter } from "vue-router"
import axios from "axios";
import { useAuth } from "@/store/auth";
import {useFriends} from "@/store/friends.ts";
import {useProfileManagement} from "@/store/profileManagement.ts";
import { useLang } from "@/composables/useLang"
import { ChatBubbleLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { EllipsisHorizontalIcon } from "@heroicons/vue/24/outline";
import { InboxArrowDownIcon } from "@heroicons/vue/24/outline";

import EditProfile from "@/components/ProfilePage/EditProfile.vue"
import FriendsList from "@/components/ProfilePage/FriendsList.vue"
import ConfirmDialogModal from '@/components/Modal/ConfirmDialogModal.vue'
import FriendButton from "@/components/ProfilePage/FriendButton.vue"
import DropDown from "@/components/DropDown.vue";
import PendingRequestModal from "@/components/Modal/ProfileModal/PendingRequestModal.vue";

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
const showPendingRequest = ref(false)
const willBlock = ref(true)
const profileUserId = ref(Number(route.params.userId))
const openBlockedDropDown = ref(false)

const ifFriends = computed(() => {
	return friendsStore.friendsList.some(r => r.friendId === profileUserId.value)
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
    } catch (err) {
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
	<div v-bind="$attrs">
		<div class="bg-[#F8F6F0] h-screen dark:bg-gray-800">
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
						<div class="ml-5 flex flex-col cursor-pointer text-left">
							<span class="font-semibold">{{ profileStore.nbFriends }}</span>
							<span class="text-gray-400 text-sm my-1">{{ t('profile.friends') }}</span>
						</div>
					</div>
					<span class="mt-4 text-sm">{{ profileStore.profileBio }}</span>
					<div class="mt-3 flex flex-row items-center">
						<div class="flex items-center">
							<button v-if="!profileStore.isOwner && ifFriends" @click="goToChatWithUser(profileUserId)"
									class="cursor-pointer border py-2 px-6 rounded-lg transition-all ease-in-out duration-500 hover:border-black dark:hover:border-gray-500 ">
								<span class="flex items-center gap-2">
									{{ t('profile.sendMessage') }}
									<ChatBubbleLeftEllipsisIcon class="w-5 h-5" />
								</span>
							</button>
							<FriendButton :profileUserId="profileUserId"></FriendButton>
							<button @click="showEditProfile = true" v-if="profileStore.isOwner"
									class="cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black dark:hover:border-gray-500">
								{{ t('profile.edit') }}
							</button>
							<button @click="showPendingRequest = true" v-if="profileStore.isOwner" class="cursor-pointer border py-2 px-3 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black ml-3 dark:hover:border-gray-500">
								<InboxArrowDownIcon class="w-6 h-6"></InboxArrowDownIcon>
							</button>
							<div v-if="!profileStore.isOwner" class="ml-3">
								<DropDown v-model="openBlockedDropDown" width-class="w-[150px]" class="mt-1">
									<template #trigger>
										<EllipsisHorizontalIcon class="w-5 h-5"></EllipsisHorizontalIcon>
									</template>
									<template #menu>
										<ul class="text-gray-900 dark:text-white">
											<li @click="toggleBlockUser" class="hover:bg-gray-100 dark:hover:bg-gray-600 py-1 px-4 cursor-pointer">
												<button class="text-red-500">{{ profileStore.isBlocked ? t('profile.unblock') : t('profile.block') }}</button>
											</li>
<!--										<button @click="toggleBlockUser" class="ml-2 cursor-pointer border py-2 px-6 rounded-lg transition-all ease-in-out duration-500">-->
<!--											{{ profileStore.isBlocked ? t('profile.unblock') : t('profile.block') }}-->
<!--										</button>-->
										</ul>
									</template>
								</DropDown>
							</div>
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
							<span>{{ profileStore.winRatio.toFixed(2) }}%</span>
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
		<PendingRequestModal v-model="showPendingRequest"></PendingRequestModal>
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
