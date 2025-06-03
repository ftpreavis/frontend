<script lang="ts" setup>
import { ref } from "vue";
import { useLang } from "@/composables/useLang"
import {useAuth} from "@/store/auth.ts";
import { useRouter } from "vue-router";

import CTAButton from "@/components/CallToActionButton.vue";
import AuthModal from "@/components/Modal/AuthModal/AuthModal.vue";

const authStore = useAuth()
const router = useRouter()
const { t } = useLang()
const showAuthModal = ref<boolean>(false)

function onClickCTA() {
	if (!authStore.isAuthenticated)
		showAuthModal.value = showAuthModal.value !== true
	else
		router.push('/pong')
}
</script>

<template>
	<div class="relative bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-700 dark:to-blue-900 h-full flex items-center justify-center">
		<div class="flex flex-col items-center space-y-6 px-4">
			<h1 class="text-5xl sm:text-6xl font-extrabold text-white drop-shadow-lg">
				Pong Game
			</h1>
			<img
				src="@/assets/pong_game.png"
				alt="pongGame"
				class="w-64 sm:w-72 md:w-80 rounded-xl shadow-2xl transform transition-transform duration-500 hover:scale-105"
			/>
			<button
				@click="onClickCTA"
				class="mt-4 inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500
               text-white font-bold text-lg py-3 px-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
			>
        <span v-if="!authStore.isAuthenticated">
          {{ t('login.submit') }}
        </span>
				<span v-else>
          {{ t('landing.play') }}
        </span>
				<svg
					v-if="authStore.isAuthenticated"
					xmlns="http://www.w3.org/2000/svg"
					class="ml-2 h-6 w-6 animate-bounce"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
				</svg>
			</button>
		</div>

		<!-- Auth Modal -->
		<AuthModal v-model="showAuthModal" />
	</div>
</template>
