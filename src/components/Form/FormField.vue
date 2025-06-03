<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
	modelValue?: string
	label: string
	type?: string
	placeholder?: string
	error?: string
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', val: string): void
	(event: 'change', ev: Event): void
}>()

const inputValue = computed({
	get: () => props.modelValue,
	set: (val: string) => emit('update:modelValue', val)
})

function onChange (e:Event) {
	emit('change', e)
}

</script>

<template>
	<label class="font-medium text-gray-800 dark:text-gray-100">
		{{ label }}
		<input v-if="type !== 'File'" v-model="inputValue" :type="type"  class="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-blue-500 dark:border-gray-500 shadow-sm rounded-lg focus:dark:border-gray-100" :placeholder="placeholder">
		<input v-else type="file" accept="image/*" @change="onChange" class="w-full mt-2 px-3 py-2  bg-transparent outline-none border focus:border-blue-500 shadow-sm rounded-lg dark:border-gray-500 focus:dark:border-gray-100">
		<span v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</span>
	</label>
</template>

