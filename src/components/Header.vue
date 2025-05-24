<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from "@/store/auth.ts";
import { useChat } from '@/store/chat'
import { computed } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'

const chatStore = useChat()

const totalUnread = computed(() =>
	Object.values(chatStore.unread).reduce((sum, c) => sum + c, 0)
)
const authStore = useAuth()

const router = useRouter()
const route = useRoute()
const go = (path: string) => {
	router.push(path)
}

const profileImage = "https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png"
const userId = 42
</script>

<template>
	<header class="text-[#F8F6F0] bg-[#fff] px-6 w-full h-[80px] shadow-md border-b border-gray-200">
		<div class="flex items-center h-full justify-between">
			<a @click="go('/')"
				class="text-4xl font-extrabold text-[#000] leading-none transform -translate-y-[3px] cursor-pointer">logo</a>
			<div class="flex items-center space-x-3">
				<LanguageSelector />
				<div v-if="!authStore.isAuthenticated && route.path === '/signup'" @click="go('/login')"
					class="text-[#1A1F36] px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border">
					{{ $t('header.SignIn')}}
				</div>
				<div v-else-if="!authStore.isAuthenticated" @click="go('/signup')"
					class="text-[#1A1F36] px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border">
					{{ $t('header.SignUp' )}}
				</div>
				<div v-else class="w-[100px] flex flex-row items-center justify-end space-x-3">
					<button @click="go('/chat')" class="relative">
						<ChatBubbleOvalLeftEllipsisIcon class="h-7 w-7 text-gray-500" />
						<span v-if="totalUnread > 0"
							class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
							{{ totalUnread }}
						</span>
					</button>
					<div class="w-[40px] h-[40px] rounded-full bg-cover cursor-pointer"
						:style="{ backgroundImage: `url(/api/users/${authStore.userId}/avatar)`, backgroundSize: `cover`, backgroundPosition: `center` }"
						@click="go('/profile/' + authStore.userId)">
					</div>
				</div>
			</div>

		</div>
	</header>
</template>
