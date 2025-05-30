<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const modalVisible = computed({
  get:  () => props.modelValue,
  set:  v  => emit('update:modelValue', v)
})

function toggle() {
	modalVisible.value = !modalVisible.value
}

const root = ref<HTMLElement|null>(null);

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    modalVisible.value = false;
  }
}

onMounted(() => window.addEventListener('click', onClickOutside));
onUnmounted(() => window.removeEventListener('click', onClickOutside));

</script>

<template>
	<div ref="root" class="relative inline-block">
		<div @click.stop="toggle">
			<slot name="trigger"></slot>
		</div>
		<transition name="fade">
			<div v-if="modalVisible" class="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 border shadow-lg z-50 py-1 rounded-md">
				<slot name="menu"></slot>
			</div>
		</transition>
	</div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .15s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>