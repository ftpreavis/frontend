<script lang="ts" setup>
defineProps<{
	label: string
}>()

const emit = defineEmits(['click'])
</script>

<template>
	<button @click="() => emit('click')" class="dark:border-gray-500 border flex justify-center py-2 rounded-md mt-4">
		<img class="w-6 h-6 " src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo">
		<span class="ml-2 dark:text-white">{{ label }}</span>
	</button>
</template>
