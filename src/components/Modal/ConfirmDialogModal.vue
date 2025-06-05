<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import Modal from '@/components/Modal/Modal.vue'
import { useLang } from "@/composables/useLang.ts"

const { t } = useLang()

const props = defineProps<{
	visible: boolean
	title: string
	message: string
	okButton: string
	cancelButton?: string
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
	(event: 'confirm', value: boolean): void
}>()

const modalValue = computed({
	get: () => props.visible,
	set: (v: boolean) => emit('update:visible', v)
})

const cancelText = ref(props.cancelButton ?? t('confirm.defaultCancel'))

watch(
	() => props.cancelButton,
	(newVal) => {
		if (newVal) cancelText.value = newVal
	}
)

function close() {
	emit('update:visible', false)
}

function confirm() {
	close()
	emit('confirm', true)
}

function cancel() {
	close()
}
</script>

<template>
	<Modal v-model="modalValue" :title="title">
		<div class="space-y-4">
			<p class="text-gray-600 dark:text-white">{{ message }}</p>
			<div class="flex flex-col sm:flex-row justify-between gap-3 pt-4">
				<button
					class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
					@click="cancel">
					{{ cancelText }}
				</button>

				<button class="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
					@click="confirm">
					{{ okButton }}
				</button>
			</div>
		</div>
	</Modal>
</template>
