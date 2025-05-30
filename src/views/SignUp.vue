<script lang="ts" setup>
import router from '@/router';
import axios from 'axios'
import { ref } from 'vue'
import { useLang } from '@/composables/useLang'
import FormField from "@/components/Form/FormField.vue";
import SubmitButton from "@/components/Form/SubmitButton.vue";
import OAuthButton from "@/components/Form/OAuthButton.vue";
import FullForm from "@/components/Form/FullForm.vue";
import { useAuth } from "@/store/auth.ts";

const { t } = useLang()
const authStore = useAuth()
const username = ref<string>('')
const password = ref<string>('')
const email = ref<string>('')
const errors = ref<{username?: string; password?: string; email?: string}>({})

const signup = async () => {
    errors.value = {}
    if (!username.value){
        errors.value.username = t('error.signup.usernameRequired')
    }
    if (!password.value){
        errors.value.password = t('error.signup.passwordRequired')
    }
    if (!email.value){
        errors.value.email = t('error.signup.emailRequired')
    }
    if (email.value && password.value && username.value){
        await authStore.signup(username.value, email.value, password.value)
    }
}

const normalLogout = async () => {
    const response = await axios.get('/api/auth/normalLogout')
    console.log(response.data)
    localStorage.removeItem('token')
}

const googleConnect = async() => {
    window.location.href = '/api/auth/google'
}

</script>

<template>
	<div class="bg-[#F8F6F0] h-screen dark:bg-gray-800">
		<div class="w-11/12 m-auto p-4 flex flex-col mt-3 md:w-[500px]">
			<h3 class="mb-5 text-center text-gray-800 dark:text-white text-2xl font-bold">{{ t('signup.title') }}</h3>
			<div class="flex flex-col p-6 bg-white rounded-xl shadow-lg dark:bg-gray-700">
				<FullForm @submit="signup">
					<FormField :label="t('signup.username')" v-model="username" :error="errors.username"></FormField>
					<FormField :label="t('signup.email')" v-model="email" type="email" :error="errors.email"></FormField>
					<FormField :label="t('signup.password')" v-model="password" type="password" :error="errors.password"></FormField>
					<p v-if="authStore.signupError" class="text-red-600 text-sm mt-1">{{ authStore.signupError }}</p>
					<SubmitButton :label="t('signup.submit')"></SubmitButton>
					<hr>
					<OAuthButton @click="googleConnect" :label="t('signup.google')"></OAuthButton>
				</FullForm>
			</div>
		</div>
	</div>
</template>
