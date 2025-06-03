<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
defineProps<{
	modelValue: boolean,
	title: string,
}>();
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
    <Teleport to="body">
		<transition
			enter-active-class="ease-out duration-300"
			enter-from-class="opacity-0 translate-y-4"
			enter-to-class="opacity-100 translate-y-0"
			leave-active-class="ease-in duration-200"
			leave-from-class="opacity-100 translate-y-0"
			leave-to-class="opacity-0 translate-y-4"
		>
			<div
				v-if="modelValue"
				class="fixed inset-0 z-50 flex items-center justify-center"
			>
				<div
					class="absolute inset-0 bg-black bg-opacity-50"
					@click="close()"
				/>
				<div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl md:w-[500px] w-[90%] max-h-[90vh] overflow-y-auto" @click.stop>
					<header class="px-6 pt-6 text-center">
						<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100">{{ title }}</h2>
						<button
							@click="close"
							type="button"
							class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl leading-none"
						>
							&times;
						</button>
					</header>

					<section class="px-6 py-4">
						<slot />
					</section>

					<footer v-if="$slots.footer" class="">
						<slot name="footer"></slot>
					</footer>
				</div>
			</div>
		</transition>
    </Teleport>
</template>
