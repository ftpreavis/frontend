<script lang="ts" setup>
import {ref, watch, computed, onMounted} from "vue"
import { useAuth } from "../../../store/auth.ts";
import { useLang } from '@/composables/useLang.ts'
import { useFriends } from "@/store/friends.ts";

import Modal from '@/components/Modal/Modal.vue'

const authStore = useAuth()
const friendStore = useFriends()
const { t } = useLang()

const pendingUsers = ref<
	Array<{
		requestId: number,
		userData: {
			id: number,
			username: string,
		} | null,
	}>
>([])

const props = defineProps<{
	modelValue: boolean,
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void
}>()

const modalVisible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val)
})

async function loadPendingUsers() {
	if (!friendStore.pendingRequests.length) {
		pendingUsers.value = []
		return
	}
	const result = friendStore.pendingRequests.map(async (pending) => {
		const user = await authStore.fetchUserById(pending.from.id)
		return {
			requestId: pending.id,
			userData: user,
		}
	})
	pendingUsers.value = await Promise.all(result)
}

watch(
	() => friendStore.pendingRequests,
	() => {
		loadPendingUsers()
	}
)

onMounted(async () => {
	await friendStore.fetchReceivedRequests()
	loadPendingUsers()
})

</script>

<template>
	<Modal v-model="modalVisible" :title="t('profile.pendingRequestsModal.title')">
		<ul v-if="pendingUsers.length" class="flex flex-col space-y-4">
			<li v-for="pending in pendingUsers" class="flex flex-row justify-between items-center">
				<div class="flex flex-row items-center space-x-2">
					<div 
						class="w-[40px] h-[40px] rounded-full bg-cover bg-center bg-no-repeat"
						:style="
							{ backgroundImage: `url(${`/api/users/${pending.userData?.id}/avatar`})` 

							}" > 
					</div>
					<span class="w-[10vh] truncate">{{ pending.userData?.username }}</span>
				</div>
				<div class="flex flex-row space-x-2 font-semibold">
					<button @click="friendStore.acceptFriendRequest(pending.requestId)">
						{{t('profile.pendingRequestsModal.accept')}}
					</button>
					<button @click="friendStore.unfriend(pending.requestId)" class="text-red-500">
						{{t('profile.pendingRequestsModal.reject')}}
					</button>
				</div>
			</li>
		</ul>
		<span v-else class="text-gray-500">{{t('profile.pendingRequestsModal.noPending')}}</span>
	</Modal>
</template>