<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

// Icons
import FlagEN from '@/assets/flags/flagEN.svg'
import FlagFR from '@/assets/flags/flagFR.svg'
import FlagDB from '@/assets/flags/flagDB.svg'

const { locale } = useI18n()
const selected = ref(locale.value)

watch(selected, (newLang) => {
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

<template>
	<div class="relative inline-block text-left w-36">
		<button
			@click="isOpen = !isOpen"
			class="inline-flex w-full justify-between items-center px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm shadow-sm hover:bg-gray-50 text-black"
		>
			<div class="flex items-center space-x-2">
				<img :src="current?.icon" alt="" class="w-5 h-5" />
				<span>{{ current?.label }}</span>
			</div>
			<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		<div
			v-if="isOpen"
			class="absolute z-50 mt-2 w-full rounded-md bg-white shadow-lg border border-gray-200"
		>
			<ul class="py-1 text-sm text-gray-700">
				<li
					v-for="lang in languages"
					:key="lang.code"
					@click="selected = lang.code; isOpen = false"
					class="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer"
				>
					<img :src="lang.icon" alt="" class="w-5 h-5 mr-2" />
					<span>{{ lang.label }}</span>
				</li>
			</ul>
		</div>
	</div>
</template>
