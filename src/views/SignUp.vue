<script lang="ts" setup>
import router from '@/router';
import axios from 'axios'
import { ref } from 'vue'
import { useLang } from '@/composables/useLang'
import FormField from "@/components/Form/FormField.vue";
import SubmitButton from "@/components/Form/SubmitButton.vue";
import OAuthButton from "@/components/Form/OAuthButton.vue";
import FullForm from "@/components/Form/FullForm.vue";

const { t } = useLang()
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
        const response = await axios.post('/api/auth/signup', {
            username: username.value,
            password: password.value,
            email: email.value,
        })
        localStorage.setItem('token', response.data.token)
        console.log(response.data)
        router.push('/')
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
	<div class="bg-[#F8F6F0] h-screen">
		<div class="w-11/12 m-auto p-4 flex flex-col mt-3 md:w-[500px]">
			<h3 class="mb-5 text-center text-gray-800 text-2xl font-bold">{{ t('signup.title') }}</h3>
			<div class="flex flex-col p-6 bg-white rounded-xl shadow-lg">
				<FullForm @submit="signup">
					<FormField :label="t('signup.username')" v-model="username" :error="errors.username"></FormField>
					<FormField :label="t('signup.email')" v-model="email" type="email" :error="errors.email"></FormField>
					<FormField :label="t('signup.password')" v-model="password" type="password" :error="errors.password"></FormField>
					<SubmitButton :label="t('signup.submit')"></SubmitButton>
					<hr>
					<OAuthButton @click="googleConnect" :label="t('signup.google')"></OAuthButton>
				</FullForm>
			</div>
		</div>
	</div>
</template>
