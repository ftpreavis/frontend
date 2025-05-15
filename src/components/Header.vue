<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import {
	HomeIcon,
	ChatBubbleOvalLeftEllipsisIcon,
	Cog6ToothIcon

} from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();
const selectedLanguage = ref(locale.value);
function changeLanguage() {
	locale.value = selectedLanguage.value;
	nextTick(() => {})
}

const router = useRouter()
const go = (path: string) => {
	router.push(path)
}
</script>

<template>
	<header
		class="bg-gradient-to-r from-[#436B9D] to-[#3589D7] px-6 py-4 w-full"
	>
		<div class="flex justify-around">
			<nav class="flex space-x-5">
				<button
					@click="go('/')"
					class="text-white hover:text-gray-200"
					aria-label="Home"
				>
					<HomeIcon class="h-6 w-6" />
				</button>
				<button
					@click="go('/chat')"
					class="text-white hover:text-gray-200"
					aria-label="Chat"
				>
					<ChatBubbleOvalLeftEllipsisIcon class="h-6 w-6" />
				</button>
				<button
					@click="go('/setting')"
					class="text-white hover:text-gray-200"
					aria-label="Play"
				>
					<Cog6ToothIcon class="h-6 w-6" />
				</button>
				<select v-model="selectedLanguage" @change="changeLanguage">
					<option value="en">EN</option>
					<option value="fr">FR</option>
				</select>
			</nav>

		</div>
	</header>
</template>
