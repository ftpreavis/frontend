<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { useAuth } from '@/store/auth.ts'
import { useRoute } from 'vue-router'
import { useLang } from "@/composables/useLang"

import ConfirmDialog from '@/components/ConfirmDialog.vue'

interface FriendRequest {
	id: number
	to: {
		id: number
		username: string
	}
}

const { t } = useLang();
const authStore = useAuth()
const connectedUserId = authStore.userId
const status = ref<'not-friends' | 'request-sent' | 'request-received' | 'friends'>('not-friends')
const showConfirm = ref<boolean>(false)
const isOwnProfile = ref<boolean>(false)
const route = useRoute()
const profileUserId = ref<number | null>(null)

const buttonLabel = computed(handleStatus)

function handleStatus() {
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

function handleClick() {
	switch (status.value) {
		case 'request-sent':
			showConfirm.value = true
			break
		case 'not-friends':
			sendFriendRequest()
			break
	}
}

const loadFriendStatus = async (newId: number) => {
	if (newId === connectedUserId) {
		isOwnProfile.value = true
		return
	}

	try {
		const sentRes = await axios.get<{ sentRequests: FriendRequest[] }>(`/api/friends/sent`, {
			params: { userId: connectedUserId },
			headers: { Authorization: `Bearer ${authStore.token}` },
		})
		const sentList = sentRes.data.sentRequests
		if (sentList.some((r) => r.to.id === newId)) {
			status.value = 'request-sent'
			return
		}
	} catch {}
}

async function onConfirm() {
	try {
		if (status.value === 'request-sent') {
			const sentRes = await axios.get<{
				sentRequests: FriendRequest[]
			}>(`/api/friends/sent`, {
				params: { userId: connectedUserId },
				headers: { Authorization: `Bearer ${authStore.token}` },
			})
			const sentList = sentRes.data.sentRequests
			const request = sentList.find((r) => r.to.id === profileUserId.value)
			if (request) {
				await axios.delete(`/api/friends/${request.id}`, {
					params: { userId: connectedUserId },
					headers: { Authorization: `Bearer ${authStore.token}` },
				})
			}
			status.value = 'not-friends'
		}
	} catch {}
}

async function sendFriendRequest() {
	try {
		await axios.post(`/api/friends/${profileUserId.value}`, {},
			{ headers: { Authorization: `Bearer ${authStore.token}` } }
		)
		status.value = 'request-sent'
	} catch {}
}

watch(
	() => route.params.userId,
	(newId) => {
		profileUserId.value = Number(newId)
		loadFriendStatus(profileUserId.value)
	},
)

onMounted(() => {
	profileUserId.value = Number(route.params.userId)
	loadFriendStatus(profileUserId.value)
})
</script>

<template>
	<div>
		<button
			v-if="!isOwnProfile"
			@click="handleClick"
			class="ml-2 cursor-pointer border py-2 px-6 rounded-lg hover:rounded-none transition-all ease-in-out duration-500 hover:border-black hover:bg-emerald-500 hover:text-white"
		>
			{{ t(buttonLabel) }}
		</button>

		<ConfirmDialog
			v-model:visible="showConfirm"
			:title="t('profile.friendButton.cancelRequestModal.title')"
			:message="t('profile.friendButton.cancelRequestModal.body')"
			:ok-button="t('profile.friendButton.cancelRequestModal.confirmButton')"
			:cancel-button="t('confirm.defaultCancel')"
			@confirm="onConfirm"
		></ConfirmDialog>
	</div>
</template>
