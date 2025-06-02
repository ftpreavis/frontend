<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLang } from "@/composables/useLang"
import {useProfileManagement} from "@/store/profileManagement.ts";
import {useFriends} from "@/store/friends.ts";

import ConfirmDialogModal from '@/components/Modal/ConfirmDialogModal.vue'

const { t } = useLang();
const friendsStore = useFriends()
const profileStore = useProfileManagement()

const props = defineProps<{
	profileUserId: number
}>()

const showConfirmUnfriend = ref<boolean>(false)
const showConfirmUnsend = ref<boolean>(false)
const profileUserId = ref<number | null>(props.profileUserId)

const buttonLabel = computed(handleText)
const status = computed<'not-friends' | 'request-sent' | 'request-received' | 'friends'>(() => {
	if (friendsStore.sentRequests.some(r => r.to.id === profileUserId.value))
		return 'request-sent'
	if (friendsStore.pendingRequests.some(r => r.from.id === profileUserId.value))
		return 'request-received'
	if (friendsStore.friendsList.some(r => r.id === profileUserId.value))
		return 'friends'

	return 'not-friends'
})

function handleText() {
	switch (status.value) {
		case 'not-friends':
			return 'profile.friendButton.buttonStatus.add'
		case 'request-sent':
			return 'profile.friendButton.buttonStatus.pending'
		case 'request-received':
		 	return 'profile.friendButton.buttonStatus.accept'
		case 'friends':
		 	return 'profile.friendButton.buttonStatus.unfriend'
	}
}

async function handleClick() {
	if (profileUserId.value === null) return
	switch (status.value) {
		case 'request-sent':
			showConfirmUnsend.value = true
			break
		case 'not-friends':
			await friendsStore.sendFriendRequest(profileUserId.value)
			break
		case 'request-received':
			const request = friendsStore.pendingRequests.find(r => r.from.id === profileUserId.value)
			if (!request) return
			await friendsStore.acceptFriendRequest(request.id)
			break
		case 'friends':
			showConfirmUnfriend.value = true
			// const target = friendsStore.friendsList.findIndex(r => r.id === profileUserId.value)
			// console.log(target)
			// await friendsStore.unfriend(target)

	}
}

function unfriend() {
	alert('Changer la route back. Front ready')
}

function unsend() {
	if (status.value === 'request-sent' && profileUserId.value) {
		friendsStore.unsend(profileUserId.value)
	}
}

watch(
	() => props.profileUserId,
	(newId) => {
		profileUserId.value = newId
	},
)
</script>

<template>
	<div>
		<button
			v-if="!profileStore.isOwner"
			@click="handleClick"
			class="ml-2 cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black hover:bg-emerald-500 hover:text-white"
		>
			{{ t(buttonLabel) }}
		</button>

		<ConfirmDialogModal
			v-model:visible="showConfirmUnfriend"
			:title="t('profile.friendButton.unfriendModal.title')"
			:message="t('profile.friendButton.unfriendModal.body')"
			:ok-button="t('profile.friendButton.unfriendModal.confirmButton')"
			:cancel-button="t('confirm.defaultCancel')"
			@confirm="unfriend"
		></ConfirmDialogModal>

		<ConfirmDialogModal
			v-model:visible="showConfirmUnsend"
			:title="t('profile.friendButton.cancelRequestModal.title')"
			:message="t('profile.friendButton.cancelRequestModal.body')"
			:ok-button="t('profile.friendButton.cancelRequestModal.confirmButton')"
			:cancel-button="t('confirm.defaultCancel')"
			@confirm="unsend"
		></ConfirmDialogModal>
	</div>
</template>
