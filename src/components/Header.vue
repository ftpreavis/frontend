<script lang="ts" setup>
import { nextTick, ref } from 'vue'
import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/vue/24/outline'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from "@/store/auth.ts";
import { useChat } from '@/store/chat'
import { computed } from 'vue'
import LanguageSelector from '@/components/LanguageSelector.vue'
import { useDarkMode } from "@/composables/useDarkMode.ts";
import DropDown from '@/components/DropDown.vue';
import AuthModal from '@/components/Modal/AuthModal/AuthModal.vue';
import SearchModal from '@/components/Modal/SearchModal.vue';
import UserSearchBar from './UserSearchBar.vue';


const { theme, toggle } = useDarkMode()

const showSearchModal = ref(false)
const modelValue = ref(false)

const chatStore = useChat()
const openDropDownProfileMenu = ref(false)

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
	<header
		class="text-[#F8F6F0] bg-[#fff] dark:bg-gray-900 px-6 w-full h-[80px] shadow-md border-b border-gray-200 dark:border-gray-600">
		<div class="flex items-center h-full justify-between">
			<a @click="go('/')"
				class="text-3xl font-extrabold text-[#000]  dark:text-white leading-none transform -translate-y-[2px] cursor-pointer">Preavis.</a>

			<UserSearchBar class="hidden sm:block w-full max-w-xs mx-4" placeholder="Search users..."
				@select="user => go('/profile/' + user.id)" />

			<button @click="showSearchModal = true" class="sm:hidden mr-3 text-gray-600 dark:text-white p-2"
				aria-label="Open search">
				<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"
					stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8" />
					<line x1="21" y1="21" x2="16.65" y2="16.65" />
				</svg>
			</button>

			<SearchModal :show="showSearchModal" @close="showSearchModal = false"
				@select="user => go('/profile/' + user.id)" />

			<div class="flex items-center">
				<LanguageSelector class="mr-2" />
				<div v-if="authStore.isAuthenticated"
					class="w-[100px] flex flex-row items-center justify-end space-x-3">
					<button @click="go('/chat')" class="relative">
						<ChatBubbleOvalLeftEllipsisIcon class="h-7 w-7 text-gray-500 dark:text-white" />
						<span v-if="totalUnread > 0"
							class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
							{{ totalUnread }}
						</span>
					</button>
					<DropDown v-model="openDropDownProfileMenu" width-class="w-32">
						<template #trigger>
							<button class="w-[40px] h-[40px] rounded-full bg-cover cursor-pointer stranslate-y-[2px]"
									:style="{ backgroundImage: `url(/api/users/${authStore.userId}/avatar)`, backgroundSize: `cover`, backgroundPosition: `center` }">
							</button>
						</template>
						<template #menu>
							<ul class="text-gray-900 dark:text-white">
								<li @click="go('/profile/' + authStore.userId); openDropDownProfileMenu = false"
									class="hover:bg-gray-100 dark:hover:bg-gray-600 py-1 px-4 cursor-pointer">
									<button>{{ $t('header.viewProfile') }}</button>
								</li>
								<li @click="toggle"
									class="hover:bg-gray-100 dark:hover:bg-gray-600 py-1 px-4 cursor-pointer">
									<button>{{ theme === 'light' ? $t('header.darkMode') : $t('header.lightMode')
									}}</button>
								</li>
								<li @click="authStore.logout"
									class="hover:bg-gray-100 dark:hover:bg-gray-600 py-1 px-4 cursor-pointer">
									<button class="text-red-500 font-semibold">{{ $t('header.logout') }}</button>
								</li>
							</ul>
						</template>
					</DropDown>
				</div>
                <div v-else class="flex flex-row space-x-2">
					<button
						@click="toggle"
						class="text-[#1A1F36] dark:text-gray-100 px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border font-bold">
						{{ theme === 'light' ? '🌙' : '☀️' }}
					</button>
					<button
						@click="modelValue = true"
						class="text-[#1A1F36] dark:text-gray-100 px-5 py-2 inline-block rounded-lg text-xs uppercase shadow-sm cursor-pointer border font-semibold">
						{{ $t('login.title') }}
					</button>
				</div>
			</div>

		</div>
		<AuthModal v-model="modelValue" />
	</header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
