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
const isLoggedIn = ref(false)
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
			<div class="flex items-center space-x-2">
				<template v-if="!isLoggedIn">
					<button
						@click="go('/login')"
						class="
						text-white font-[Kanit] px-4 py-2 rounded-lg shadow-lg"
					>
						Login
					</button>
					<button
						@click="go('/signup')"
						class="text-[#3589D7] bg-white font-[Kanit] px-4 py-2 rounded-lg shadow-lg"
					>
						Sign Up
					</button>
				</template>
				<template v-else>
				</template>
			</div>
		</div>
	</header>
</template>
