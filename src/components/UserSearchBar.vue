<script setup lang="ts">

/* -------------------------------------------------------------------------- */
/*                                   Imports                                  */
/* -------------------------------------------------------------------------- */

import { ref, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue'
import { useUserSearch } from '@/composables/useUserSearch'
import { useRoute } from 'vue-router'

/* -------------------------------------------------------------------------- */
/*                                   Usings                                   */
/* -------------------------------------------------------------------------- */

const route = useRoute()

/* -------------------------------------------------------------------------- */
/*                                   Scripts                                  */
/* -------------------------------------------------------------------------- */

const props = defineProps<{ placeholder?: string }>()
const emit = defineEmits<{
	(e: 'select', user: { id: number; username: string; avatar: string }): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const { searchQuery, searchResults, search, loading } = useUserSearch()
const isFocused = ref(false)

const handleClickOutside = (event: MouseEvent) => {
	if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
		isFocused.value = false
	}
}

defineExpose({
	clear: () => {
		searchQuery.value = ''
	}
})

watch(() => route.fullPath, () => {
	searchQuery.value = ''
	isFocused.value = false
	searchResults.value = []
})

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
	<div ref="wrapperRef" class="relative w-full max-w-xs md:max-w-sm">
		<input v-model="searchQuery" @focus="isFocused = true" @input="search"
			:placeholder="placeholder || 'Search users...'"
			class="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
			type="text" />

		<!-- Dropdown results -->
		<div v-if="searchResults.length > 0 && isFocused"
			class="absolute left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
			<div class="scrollbar max-h-64 overflow-y-auto">
				<ul>
					<li v-for="user in searchResults" :key="user.id" @click="emit('select', user); isFocused = false"
						class="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
						<img :src="`/api/users/${user.id}/avatar`" class="w-8 h-8 rounded-full object-cover"
							alt="avatar" />
						<span class="text-sm text-gray-900 dark:text-gray-100">{{ user.username }}</span>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* Enable smooth overlay-style scrollbars */
.scrollbar {
	overflow-y: overlay;
	/* Works in Chrome-based browsers */
	scrollbar-width: thin;
	/* Firefox */
	scrollbar-gutter: stable;
}

/* WebKit (Chrome, Edge, Safari) */
.scrollbar::-webkit-scrollbar {
	width: 10px;
	height: 10px;
	background: transparent;
}

.scrollbar::-webkit-scrollbar-track {
	background: transparent;
}

.scrollbar::-webkit-scrollbar-thumb {
	background-color: rgba(100, 100, 100, 0.6);
	border-radius: 9999px;
	background-clip: content-box;
	border: 2px solid transparent;
	transition: background-color 0.2s ease;
}

.scrollbar::-webkit-scrollbar-thumb:hover {
	background-color: rgba(100, 100, 100, 0.8);
}

.scrollbar::-webkit-scrollbar-button {
	display: none;
	width: 0;
	height: 0;
}

/* Firefox */
.scrollbar {
	scrollbar-color: rgba(100, 100, 100, 0.6) transparent;
}
</style>
