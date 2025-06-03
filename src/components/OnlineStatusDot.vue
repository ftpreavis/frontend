<template>
	<div class="relative inline-block">
		<slot />
		<span
			class="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700"
			:class="isOnline(userId) ? 'bg-green-500' : 'bg-gray-400'"
		/>
	</div>
</template>

<script setup lang="ts">
import { useAuth } from '@/store/auth'

const props = defineProps<{
	userId: number
}>()

const authStore = useAuth()
const isOnline = authStore.isOnline
</script>
