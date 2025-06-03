<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useAuth } from '../../../store/auth.ts'
import { useLang } from '@/composables/useLang.ts'
import { useFriends } from '@/store/friends.ts'

import Modal from '@/components/Modal/Modal.vue'
import {useRouter} from "vue-router";

const authStore = useAuth()
const friendStore = useFriends()
const { t } = useLang()
const router = useRouter()

const pendingUsers = ref<
	Array<{
		requestId: number
		userData: {
			id: number
			username: string
		} | null
	}>
>([])

const props = defineProps<{
	modelValue: boolean
}>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void
}>()

const modalVisible = computed({
	get: () => props.modelValue,
	set: (val: boolean) => emit('update:modelValue', val),
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

const go = (path: string) => {
	router.push(path)
}

watch(
	() => friendStore.pendingRequests,
	async () => {
		await loadPendingUsers()
	},
)

onMounted(async () => {
	await friendStore.fetchReceivedRequests()
	await loadPendingUsers()
})
</script>

<template>
	<Modal v-model="modalVisible" :title="t('profile.pendingRequestsModal.title')">
		<ul v-if="pendingUsers.length" class="flex flex-col space-y-4">
			<li
				v-for="pending in pendingUsers"
				:key="pending.requestId"
				class="relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform hover:scale-[1.01] transition-transform duration-200"
			>
<!--				<div class="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-teal-400 to-blue-500"></div>-->
				<div class="flex flex-row justify-between items-center px-4 py-3">
					<div class="flex flex-row items-center space-x-3 cursor-pointer" @click="go('/profile/' + pending.userData?.id), modalVisible = false">
						<div
							class="w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat ring-2 ring-white"
							:style="{ backgroundImage: `url(/api/users/${pending.userData?.id}/avatar)` }"
							v-if="pending.userData"
						></div>
						<div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
							<span class="text-xs">{{ t('profile.pendingRequestsModal.notFound') }}</span>
						</div>
						<span class="text-gray-900 dark:text-gray-100 font-medium truncate max-w-[150px]"> {{ pending.userData?.username }}</span>
					</div>

					<div class="flex flex-row space-x-2">
						<button
							v-if="pending.userData"
							@click="friendStore.acceptFriendRequest(pending.requestId)"
							class="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg text-sm font-semibold
                   shadow-sm hover:from-green-500 hover:to-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-300"
						>
							{{ t('profile.pendingRequestsModal.accept') }}
						</button>
						<button
							@click="friendStore.unfriend(pending.requestId)"
							class="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg text-sm font-semibold
                   shadow-sm hover:from-red-500 hover:to-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
						>
							<span v-if="pending.userData">{{ t('profile.pendingRequestsModal.reject') }}</span>
							<span v-else>{{ t('profile.pendingRequestsModal.cancel') }}</span>
						</button>
					</div>
				</div>
			</li>
		</ul>

		<span v-else class="text-gray-500 dark:text-gray-400 italic">
    {{ t('profile.pendingRequestsModal.noPending') }}
  </span>
	</Modal>
</template>
