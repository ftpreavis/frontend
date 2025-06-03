<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
	label?: string
	variant?: 'primary' | 'secondary' | 'danger'
	type?: 'button' | 'submit' | 'reset'
	disabled?: boolean
}>()

const variant = props.variant || 'primary'
const type = props.type || 'button'
const disabled = props.disabled || false

const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2'

const variantClasses = computed(() => {
	if (variant === 'primary') {
		return [
			'bg-gradient-to-r from-teal-400 to-blue-500 text-white',
			'hover:from-blue-500 hover:to-teal-400',
			'focus:ring-blue-500',
			disabled ? 'opacity-50 cursor-not-allowed' : ''
		].filter(Boolean).join(' ')
	} else if (variant === 'secondary') {
		return [
			'bg-white text-gray-700 border border-gray-300',
			'hover:bg-gray-50',
			'focus:ring-gray-300',
			disabled ? 'opacity-50 cursor-not-allowed' : ''
		].filter(Boolean).join(' ')
	} else if (variant === 'danger') {
		return [
			'bg-red-600 text-white',
			'hover:bg-red-700 hover:animate-pulse',
			'focus:ring-red-500',
			disabled ? 'opacity-50 cursor-not-allowed' : ''
		].filter(Boolean).join(' ')
	} else {
		return ''
	}
})
</script>

<template>
	<button
		:type="type"
		@click="$emit('click', $event)"
		:class="baseClasses + ' ' + variantClasses"
		:disabled="disabled"
	>
		<slot>
			{{ label }}
		</slot>
	</button>
</template>
