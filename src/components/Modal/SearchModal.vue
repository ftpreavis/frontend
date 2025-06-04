<script setup lang="ts">
import UserSearchBar from '@/components/UserSearchBar.vue'
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
	show: boolean
}>()

const emit = defineEmits<{
	(e: 'close'): void
	(e: 'select', user: { id: number; username: string; avatar: string }): void
}>()

function onKeyDown(e: KeyboardEvent) {
	if (e.key === 'Escape') emit('close')
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
	<Teleport to="body">
		<transition name="fade">
			<div
				v-if="show"
				class="fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6"
				role="dialog"
				aria-modal="true"
			>
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-lg font-semibold text-gray-900 dark:text-white">Search</h2>
					<button @click="emit('close')" class="text-gray-500 dark:text-gray-300 text-xl">&times;</button>
				</div>
				<UserSearchBar
					placeholder="Search users..."
					@select="user => { emit('select', user); emit('close') }"
				/>
			</div>
		</transition>
	</Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
