<script lang="ts" setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useAuth } from "@/store/auth.ts";
import { useLang } from '@/composables/useLang'

const { t } = useLang()
const username = ref<string>('')
const password = ref<string>('')
const token2FA = ref<string>('')
const errors = ref<{ username?: string; password?: string; token2FA?: string }>({})
const authStore = useAuth()
const loginError = ref<string>('')
const requires2FA = ref<boolean>(false)

onMounted(() => { console.log('yo') })

const login = async () => {
	errors.value = {}

	if (!username.value) {
		errors.value.username = t('error.login.usernameRequired')
	}
	if (!password.value) {
		errors.value.password = t('error.login.passwordRequired')
	}
	if (username.value && password.value) {
		if (await authStore.authenticate(username.value, password.value)) {
			requires2FA.value = true
		}
	}
	// await router.push('/')
	// .then(() => {window.location.reload()})
}

const log2FA = async () => {
	if (!token2FA.value) {
		errors.value.token2FA = t('error.login.tokenRequired')
	}
	else
		await authStore.authenticate2FA(username.value, token2FA.value)
}

const googleLogout = async () => {
	const response = await axios.get('/api/auth/logout')
	console.log(response.data)
}

const normalLogout = async () => await authStore.logout()

const googleConnect = async () => {
	await authStore.googleConnect()
}

</script>

<template>
	<div class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
		<div v-if="!requires2FA" class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
			<h3 class="mb-3 text-center">{{ t('login.title') }}</h3>
			<div class="border flex flex-col p-4 space-y-3">
				<p v-if="loginError" class="text-red-600 text-sm mt-1">{{ loginError }}</p>
				<form @submit.prevent="login" class="flex flex-col justify-center space-y-3">
					<label>
						{{ t('login.username') }} :
						<input v-model="username" type="text" class="border-2 rounded h-8 w-full">
						<p v-if="errors.username" class="text-red-600 text-sm mt-1">{{ errors.username }}</p>
					</label>
					<label>
						{{ t('login.password') }} :
						<input v-model="password" type="password" class="border-2 rounded h-8 w-full">
						<p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
					</label>
					<input type="submit" :value="t('login.submit')"
						class="py-2 px-5 border rounded text-blue-600 shadow-md cursor-pointer">
				</form>
				<hr>
				<button @click="googleConnect"
					class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.google')
					}}</button>
				<button @click="normalLogout"
					class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.logout')
					}}</button>
				<button @click="googleLogout"
					class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.logoutGoogle')
					}}</button>
			</div>
		</div>
		<div v-if="requires2FA" class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
			<h3 class="mb-3 text-center">{{ t('login.2faTitle') }}</h3>
			<div class="border flex flex-col p-4 space-y-3">
				<p class="text-sm text-gray-600 mb-2 text-center">{{ t('login.2faPrompt') }}</p>
				<p v-if="loginError" class="text-red-600 text-sm mt-1">{{ loginError }}</p>
				<form @submit.prevent="log2FA" class="flex flex-col justify-center space-y-3">
					<label>
						<input v-model="token2FA" type="text" class="border p-2 w-full rounded mb-2 text-center"
							:placeholder="t('login.2faPlaceholder')">
						<p v-if="errors.token2FA" class="text-red-600 text-sm mt-1">{{ errors.token2FA }}</p>
					</label>
					<input type="submit" :value="t('login.2faSubmit')"
						class="py-2 px-5 border rounded text-blue-600 shadow-md cursor-pointer">
				</form>
				<hr>
				<button @click="googleConnect"
					class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.google')
					}}</button>
			</div>
		</div>
	</div>
</template>
