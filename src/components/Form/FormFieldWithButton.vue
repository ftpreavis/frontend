<script setup lang="ts">
import {computed} from "vue";

import ErrorMessage from "@/components/Utils/ErrorMessage.vue";
import FormField from "./FormField.vue";


const props = defineProps<{
	modelValue?: string
	label: string
	type?: string
	placeholder?: string
	error?: string
	disabled?: boolean
	buttonText: string
}>();

const emit = defineEmits<{
	(event: 'update:modelValue', val: string): void
	(event: 'change', ev: Event): void
	(event: 'click', ev: MouseEvent): void   
}>()

const inputValue = computed({
	get: () => props.modelValue,
	set: (val: string) => emit('update:modelValue', val)
})

function onChange (e:Event) {
	emit('change', e)
}

function onClick(e: MouseEvent) {
  emit('click', e)
}

</script>

<template>
	<div class="flex">
		<FormField v-model="inputValue" :label :type="type" :placeholder="placeholder" :error="error" @change="onChange"></FormField>
		<button :disabled="disabled"
				@click="onClick"
				class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 h-[42px] self-end">
					{{ buttonText }}</button>
	</div>
</template>

