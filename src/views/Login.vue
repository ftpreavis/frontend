<script lang="ts" setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useAuth } from "@/store/auth.ts";
import { useLang } from '@/composables/useLang'

import FormField from "@/components/Form/FormField.vue";
import SubmitButton from "@/components/Form/SubmitButton.vue";
import OAuthButton from "@/components/Form/OAuthButton.vue";
import FullForm from "@/components/Form/FullForm.vue";

const { t } = useLang()
const username = ref<string>('')
const password = ref<string>('')
const token2FA = ref<string>('')
const errors = ref<{ username?: string; password?: string; token2FA?: string }>({})
const authStore = useAuth()
const requires2FA = ref<boolean>(false)

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
	<div class="bg-[#F8F6F0] h-screen dark:bg-gray-800">
		<div class="w-11/12 m-auto p-4 flex flex-col mt-3 md:w-[500px]">
			<div v-if="!requires2FA">
				<h3 class="mb-5 text-center text-gray-800 dark:text-gray-100 text-2xl font-bold">{{ t('login.title') }}</h3>
				<div class="flex flex-col p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
					<FullForm @submit="login">
						<FormField :label="t('login.username')" v-model="username" :error="errors.username"></FormField>
						<FormField :label="t('login.password')" v-model="password" type="password"  :error="errors.password"></FormField>
						<p v-if="authStore.loginError" class="text-red-600 text-sm mt-1">{{ authStore.loginError }}</p>
						<SubmitButton :label="t('login.submit')"></SubmitButton>
						<hr>
						<OAuthButton @click="googleConnect" :label="t('signup.google')"></OAuthButton>
					</FullForm>
<!--					<button @click="normalLogout"-->
<!--						class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.logout')-->
<!--						}}</button>-->
<!--					<button @click="googleLogout"-->
<!--						class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">{{ t('login.logoutGoogle')-->
<!--						}}</button>-->
				</div>
			</div>
			<div v-if="requires2FA">
				<h3 class="mb-5 text-center text-gray-800 text-2xl font-bold">{{ t('login.2faTitle') }}</h3>
				<div class="border flex flex-col p-4 space-y-3 bg-white rounded-xl shadow-lg">
					<p class="text-sm text-gray-600 mb-2">{{ t('login.2faPrompt') }}</p>
					<p v-if="loginError" class="text-red-600 text-sm mt-1">{{ loginError }}</p>
					<FullForm @submit="log2FA">
						<FormField v-model="token2FA" label="" :error="errors.token2FA" :placeholder="t('login.2faPlaceholder')"/>
						<SubmitButton :label="t('login.2faSubmit')"></SubmitButton>
					</FullForm>
					<hr>
					<OAuthButton @click="googleConnect" :label="t('login.google')"></OAuthButton>
				</div>
			</div>
		</div>
	</div>
</template>
