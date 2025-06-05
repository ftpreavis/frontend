<script setup lang="ts">
defineProps<{
	title: string
	avatar: string
	message: string
}>()
</script>

<template>
	<div class="flex items-start space-x-3 max-w-xs">
		<img :src="avatar" alt="avatar" class="object-contain object-center w-10 h-10 rounded-full object-cover" />
		<div class="flex flex-col overflow-hidden">
			<strong class="text-sm font-semibold text-gray-900 truncate">{{ title }}</strong>
			<span class="text-sm text-gray-600 truncate">{{ message }}</span>
		</div>
	</div>
</template>
