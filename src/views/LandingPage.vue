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
	<div class="bg-[#F8F6F0] h-screen dark:bg-gray-800">
		<div class="flex items-center justify-center h-full">
			<div class="flex flex-col space-y-4">

				<h1 class="text-[45px] font-bold">Pong Game</h1>
				<img src="@/assets/pong_game.png" alt="pongGame" class="w-[300px] rounded-xl">
				<button @click="onClickCTA" class="bg-blue-500 py-4 px-[100px] rounded text-white cursor-pointer font-bold text-md">
					<span v-if="!authStore.isAuthenticated">
						{{ t('login.submit')}}
					</span>
					<span v-else>
						{{ t('landing.play')}}
					</span>
				</button>
			</div>
		</div>
		<AuthModal v-model="showAuthModal"></AuthModal>
	</div>
</template>
