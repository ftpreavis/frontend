<script lang="ts" setup>
defineProps<{ label: string }>()
</script>

<template>
	<input type="submit" :value="label" class="py-2 px-5 rounded-md text-blue-600 text-white bg-blue-500  cursor-pointer">
</template>
