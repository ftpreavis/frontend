<script setup lang="ts">
import { ref, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import { useLang } from "@/composables/useLang"

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
	emit('confirm', false)
}
</script>

<template>
	<Modal v-if="visible" :visible="visible" @update:visible="val => emit('update:visible', val)">
		<div class="text-center space-y-4">
			<h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
			<p class="text-gray-600">{{ message }}</p>
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
