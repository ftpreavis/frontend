<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DropDown from './DropDown.vue'
import { useAuth } from '@/store/auth'

// Icons
import FlagEN from '@/assets/flags/flagEN.svg'
import FlagFR from '@/assets/flags/flagFR.svg'
import FlagDB from '@/assets/flags/flagDB.svg'
import axios from 'axios'

const { locale } = useI18n()
const selected = ref(locale.value)
const authStore = useAuth()

watch(selected, async(newLang) => {
    if (authStore.isAuthenticated) {
        await axios.patch(`/api/users/${authStore.userId}/settings`, {lang: newLang})
    }
	locale.value = newLang
	localStorage.setItem('lang', newLang)
})

const isOpen = ref(false)

const languages = [
	{ code: 'en', label: 'English', icon: FlagEN },
	{ code: 'fr', label: 'Français', icon: FlagFR },
	{ code: 'db', label: 'DragonBorn', icon: FlagDB },
]

const current = computed(() => languages.find((l) => l.code === selected.value))
</script>

<!--				<span>{{ current?.label }}</span>-->
				<!--					<span>{{ lang.label }}</span>-->
<template>
	<DropDown v-model="isOpen" width-class="w-full">
		<template #trigger>
			<button
				class="inline-flex w-full justify-between items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm dark:bg-gray-900 shadow-sm hover:bg-gray-50 text-black"
			>
				<div class="flex items-center space-x-2">
					<img :src="current?.icon" alt="" class="w-5 h-5" />
				</div>
				<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
		</template>
		<template #menu>
			<ul class="py-1 text-sm text-gray-700">
				<li
					v-for="lang in languages"
					:key="lang.code"
					@click="selected = lang.code; isOpen = false"
					class="flex items-center justify-center py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
				>
					<button><img :src="lang.icon" alt="" class="w-5 h-5" /></button>	

				</li>
			</ul>
		</template>
	</DropDown>
	<!-- <div class="relative inline-block text-left">
		<button
			@click="isOpen = !isOpen"
			class="inline-flex w-full justify-between items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm dark:bg-gray-900 shadow-sm hover:bg-gray-50 text-black"
		>
			<div class="flex items-center space-x-2">
				<img :src="current?.icon" alt="" class="w-5 h-5" />
			</div>
			<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<div
			v-if="isOpen"
			class="absolute z-50 mt-2 w-full rounded-md bg-white dark:bg-gray-900 shadow-lg border border-gray-200 "
		>
			<ul class="py-1 text-sm text-gray-700">
				<li
					v-for="lang in languages"
					:key="lang.code"
					@click="selected = lang.code; isOpen = false"
					class="flex items-center justify-center py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
				>
					<img :src="lang.icon" alt="" class="w-5 h-5" />

				</li>
			</ul>
		</div>
	</div> -->
</template>
