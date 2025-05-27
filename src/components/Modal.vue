<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";

const props = defineProps<{
	modelValue: boolean,
	title: string,
}>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void
}>()

const close = () => {
	emit('update:modelValue', false)
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Escape') close()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
	<transition name="fade">
		<div
			v-if="modelValue"
			class="fixed inset-0 z-50 flex items-center justify-center"
		>
			<div
				class="absolute inset-0 bg-black bg-opacity-50"
				@click="close()"
			/>
			<div class="relative bg-white rounded-2xl shadow-xl w-[90%]" @click.stop>
				<header class="px-6 pt-6 text-center">
					<h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
					<button
						@click="close"
						class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl leading-none"
					>
						&times;
					</button>
				</header>

				<section class="px-6 py-4">
					<slot />
				</section>

				<footer v-if="$slots.footer" class="mt-3">
					<slot name="footer"></slot>
				</footer>
			</div>
<!--			<div-->
<!--				class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full relative"-->
<!--				@click.stop-->
<!--			>-->
<!--				<button-->
<!--					@click="close"-->
<!--					class="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"-->
<!--				>-->
<!--					&times;-->
<!--				</button>-->
<!--				<slot />-->
<!--			</div>-->
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
