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
		<transition
			enter-active-class="transition ease-out duration-200"
			enter-from-class="opacity-0 scale-95"
			enter-to-class="opacity-100 scale-100"
			leave-active-class="transition ease-in duration-150"
			leave-from-class="opacity-100 scale-100"
			leave-to-class="opacity-0 scale-95"
		>
			<div v-if="isOpen" class="absolute right-0 mt-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 border shadow-xl z-50 py-1 rounded-lg" :class="[menuWidth]">
				<slot name="menu"></slot>
			</div>
		</transition>
	</div>
</template>

