<script lang="ts" setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useLang } from '@/composables/useLang.ts'
import { useProfileManagement } from '@/store/profileManagement.ts'

import Modal from '@/components/Modal/Modal.vue'
import FormField from '@/components/Form/FormField.vue'
import AppButton from "@/components/Utils/AppButton.vue";
import ErrorMessage from "@/components/Utils/ErrorMessage.vue";

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
			<p class="text-gray-700 font-light dark:text-white">
				{{ t('profile.deleteProfile.lastModal.body') }}
			</p>
			<FormField label="Username" v-model="username" class="w-full" />
			<ErrorMessage :error="error"></ErrorMessage>
		</div>
		<template #footer>
			<AppButton @click="modalVisible = false" :label="t('profile.deleteProfile.lastModal.cancelButton')" variant="secondary" type="button"></AppButton>
			<AppButton @click="deleteAccount" :label="t('profile.deleteProfile.lastModal.confirmButton')" variant="danger" type="button"></AppButton>
		</template>
	</Modal>
</template>
