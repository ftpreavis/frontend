<script lang="ts" setup>
import {c} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";

const props = defineProps<{
	visible: boolean
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
}>()

const close = () => emit('update:visible', false)
</script>

<template>
	<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20" @click="close">
		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]" @click.stop>
			<div>Photo profile</div>
			<input type="text" placeholder="Profile Name" class="border-[2px]">
			<input type="text" placeholder="Bio" class="border-[2px]">
			<input type="text" placeholder="" class="border-[2px]">
			<button class="cursor-pointer" @click="close">close</button>
		</div>
	</div>
</template>
