<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from "@/store/auth.ts";
import { useChat } from '@/store/chat'
import { computed } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { useDarkMode } from "@/composables/useDarkMode.ts";

const {theme, toggle} = useDarkMode()

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

</script>

<template>
	<header class="text-[#F8F6F0] bg-[#fff] dark:bg-gray-900 px-6 w-full h-[80px] shadow-md border-b border-gray-200 dark:border-gray-600">
		<button
			@click="toggle"
			class="fixed bottom-96 right-4 p-2 bg-gray-200 rounded dark:bg-gray-700"
		>
			{{ theme === 'light' ? '🌙 Dark' : '☀️ Light' }}
		</button>
		<div class="flex items-center h-full justify-between">
			<a @click="go('/')"
				class="text-3xl font-extrabold text-[#000]  dark:text-white leading-none transform -translate-y-[2px] cursor-pointer">Preavis.</a>
			<div class="flex items-center">
				<LanguageSelector class="mr-2" />
				<div v-if="!authStore.isAuthenticated && route.path === '/signup'" @click="go('/login')"
					class="text-[#1A1F36] dark:text-gray-100 px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border font-semibold">
					{{ $t('header.signIn')}}
				</div>
				<div v-else-if="!authStore.isAuthenticated" @click="go('/signup')"
					class="text-[#1A1F36] dark:text-gray-100 px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border font-semibold">
					{{ $t('header.signUp' )}}
				</div>
				<div v-else class="w-[100px] flex flex-row items-center justify-end space-x-3">
					<button @click="go('/chat')" class="relative">
						<ChatBubbleOvalLeftEllipsisIcon class="h-7 w-7 text-gray-500 dark:text-white" />
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
