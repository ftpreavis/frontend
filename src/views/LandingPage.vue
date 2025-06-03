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
		<div class="flex w-10/12 m-auto flex-col items-center">
			<div class="mt-8">
<!--				<h1 class="text-[50px] font-semibold dark:text-gray-100">{{ t('landing.title') }}</h1>-->
<!--				<p class="text-gray-600 dark:text-gray-400 mt-1">{{ t('landing.tagline') }}</p>-->
				<div class="flex flex-row items-center mt-4">
					<CTAButton to="" @click="onClickCTA" class="">
						Play Now !
					</CTAButton>
				</div>
			</div>
		</div>
		<AuthModal v-model="showAuthModal"></AuthModal>
	</div>
</template>
