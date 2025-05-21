<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import {
	HomeIcon,
	ChatBubbleOvalLeftEllipsisIcon,
	Cog6ToothIcon

} from '@heroicons/vue/24/outline'
import {useRoute, useRouter} from 'vue-router'
import { useI18n } from 'vue-i18n';
import {useAuth} from "@/store/auth.ts";

const authStore = useAuth()

const { t, locale } = useI18n();
const selectedLanguage = ref(locale.value);
function changeLanguage() {
	locale.value = selectedLanguage.value;
	nextTick(() => {})
}

const router = useRouter()
const route = useRoute()
const go = (path: string) => {
	router.push(path)
}

const profileImage = "https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png"
const userId = 42
</script>

<template>
	<header
		class="text-[#F8F6F0] bg-[#fff] px-6 w-full h-[80px] shadow-md border-b border-gray-200"
	>
		<div class="flex items-center h-full justify-between">
			<a @click="go('/')" class="text-4xl font-extrabold text-[#000] leading-none transform -translate-y-[3px] cursor-pointer">logo</a>
			<div v-if="!authStore.isAuthenticated && route.path === '/signup'" @click="go('/login')" class="text-[#1A1F36] px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border">
				sign in
			</div>
			<div v-else-if="!authStore.isAuthenticated" @click="go('/signup')" class="text-[#1A1F36] px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border">
				sign up
			</div>
			<div v-else class="w-[100px] flex flex-row items-center justify-end space-x-3">
				<button @click="go('/chat')">
					<ChatBubbleOvalLeftEllipsisIcon class="h-7 w-7 text-gray-500"></ChatBubbleOvalLeftEllipsisIcon>
				</button>
				<div class="w-[40px] h-[40px] rounded-full bg-cover cursor-pointer" :style="{ backgroundImage: `url(${profileImage})`}" @click="go('/profile/' + authStore.userId)">
				</div>
			</div>
<!--			<nav class="flex space-x-5">-->
<!--				<button-->
<!--					@click="go('/')"-->
<!--					class="text-white hover:text-gray-200"-->
<!--					aria-label="Home"-->
<!--				>-->
<!--					<HomeIcon class="h-6 w-6" />-->
<!--				</button>-->
<!--				<button-->
<!--					@click="go('/chat')"-->
<!--					class="text-white hover:text-gray-200"-->
<!--					aria-label="Chat"-->
<!--				>-->
<!--					<ChatBubbleOvalLeftEllipsisIcon class="h-6 w-6" />-->
<!--				</button>-->
<!--				<button-->
<!--					@click="go('/setting')"-->
<!--					class="text-white hover:text-gray-200"-->
<!--					aria-label="Play"-->
<!--				>-->
<!--					<Cog6ToothIcon class="h-6 w-6" />-->
<!--				</button>-->
<!--				<select v-model="selectedLanguage" @change="changeLanguage">-->
<!--					<option value="en">EN</option>-->
<!--					<option value="fr">FR</option>-->
<!--				</select>-->
<!--			</nav>-->

		</div>
	</header>
</template>
