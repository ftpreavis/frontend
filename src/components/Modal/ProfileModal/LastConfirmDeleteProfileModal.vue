<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useLang } from '@/composables/useLang.ts'
import { useProfileManagement } from '@/store/profileManagement.ts'

import Modal from '@/components/Modal/Modal.vue'
import FormField from '@/components/Form/FormField.vue'

const profileStore = useProfileManagement()
const { t } = useLang()

const username = ref('')
const error = ref('')

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

function deleteAccount() {
	if (!username.value) {
		error.value = 'profile.deleteProfile.lastModal.error.enterUsername'
		return
	}
	error.value = ''
	if (username.value === profileStore.profileUser.username) {
		profileStore.deleteAccount()
	} else {
		error.value = 'profile.deleteProfile.lastModal.error.notMatch'
	}
}

watch(
	modalVisible,
	() => {
		error.value = ''
		username.value = ''
	}
)

onMounted(() => {
	username.value = ''
	error.value = ''
})
</script>

<template>
	<Modal v-model="modalVisible" :title="t('profile.deleteProfile.lastModal.title')">
		<div class="flex flex-col space-y-5 mb-6">
			<p class="text-gray-700 text-base">
				{{ t('profile.deleteProfile.lastModal.body') }}
			</p>
			<FormField label="Username" v-model="username" class="w-full" />
			<transition
				enter-active-class="transition-opacity duration-200"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition-opacity duration-150"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<p
					v-if="error"
					class="mt-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 flex items-center space-x-2"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-4 w-4 flex-shrink-0 text-red-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"
						/>
					</svg>
					<span>{{ t(error) }}</span>
				</p>
			</transition>
		</div>
		<template #footer>
			<div class="flex flex-col space-y-3 w-[90%] mx-auto mb-5">
				<button
					@click="modalVisible = false"
					class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
				>
					{{ t('profile.deleteProfile.lastModal.cancelButton') }}
				</button>
				<button
					@click="deleteAccount"
					class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 transform hover:animate-pulse focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
				>
					{{ t('profile.deleteProfile.lastModal.confirmButton') }}
				</button>
			</div>
		</template>
	</Modal>
</template>
