<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';

const root = ref<HTMLElement|null>(null);
let nextDropdownId = 0
const dropdownId = nextDropdownId++
const menuWidth = computed(() => props.widthClass)

const props = defineProps<{
  modelValue: boolean,
  widthClass: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const isOpen = computed({
  get:  () => props.modelValue,
  set:  v  => emit('update:modelValue', v)
})

function toggle() {
	window.dispatchEvent(new CustomEvent('dropdown-toggle', { detail: dropdownId }))
	isOpen.value = !isOpen.value
}

function onClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function onGlobalToggle(e: Event) {
	const ev = e as CustomEvent<number>
	if (ev.detail !== dropdownId && isOpen.value) {
		isOpen.value = false
	}
}


onMounted(() => {
	window.addEventListener('dropdown-toggle', onGlobalToggle)
	window.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
	window.removeEventListener('dropdown-toggle', onGlobalToggle)
	window.removeEventListener('click', onClickOutside)
})
</script>

<template>
	<div ref="root" class="relative inline-block">
		<div @click.stop="toggle">
			<slot name="trigger"></slot>
		</div>
		<transition name="fade">
			<div v-if="isOpen" class="absolute right-0 mt-2 bg-white dark:bg-gray-700 border shadow-lg z-50 py-1 rounded-md" :class="[menuWidth]">
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