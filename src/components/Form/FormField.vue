<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
	modelValue: string
	label: string
	type?: string
	placeholder?: string
	error?: string
}>();
const emit = defineEmits(['update:modelValue'])

const inputValue = computed({
	get: () => props.modelValue,
	set: (val: string) => emit('update:modelValue', val)
})
</script>

<template>
	<label class="font-medium text-gray-800">
		{{ label }}
		<input v-model="inputValue" :type="type"  class="w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-blue-500 shadow-sm rounded-lg" :placeholder="placeholder">
		<span v-if="error" class="text-red-600 text-sm mt-1">{{ error }}</span>
	</label>
</template>

