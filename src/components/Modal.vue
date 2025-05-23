<script setup lang="ts">
const props = defineProps<{
	visible: boolean
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
}>()

const close = () => {
	emit('update:visible', false)
}
</script>

<template>
	<transition name="fade">
		<div
			v-if="visible"
			class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
			@click="close"
		>
			<div
				class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative"
				@click.stop
			>
				<button
					@click="close"
					class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
				>
					&times;
				</button>
				<slot />
			</div>
		</div>
	</transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
