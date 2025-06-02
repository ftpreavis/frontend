<script lang="ts" setup>
const emit = defineEmits(['submit'])

const submit = () => {
	emit('submit')
}
</script>

<template>
	<form @submit.prevent="submit" class="flex flex-col justify-center space-y-5">
		<slot></slot>
	</form>
</template>
