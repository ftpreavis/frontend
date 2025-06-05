<script setup lang="ts">
import { defineProps } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
	error?: string
}>()

const { t } = useI18n()
</script>

<template>
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
</template>
