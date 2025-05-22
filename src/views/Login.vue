<script lang="ts" setup>
import router from '@/router';
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useAuth } from "@/store/auth.ts";
import Header from "@/components/Header.vue";
import {parseAstAsync} from "vite";

const username = ref<string>('')
const password = ref<string>('')
const token2FA = ref<string>('')
const errors = ref<{ username?: string; password?: string}>({})
const authStore = useAuth()
const loginError = ref<string>('')

onMounted(() => {console.log('yo')})

const login = async () => {
    errors.value = {}

    if (!username.value){
        errors.value.username = "Le nom d'utilisateur est requis."
    }
    if (!password.value){
        errors.value.password = "Le mot de passe est requis."
    }
    if (username.value && password.value) await authStore.authenticate(username.value, password.value, token2FA.value)
	// await router.push('/')
		// .then(() => {window.location.reload()})
}

const googleLogout = async() => {
    const response = await axios.get('/api/auth/logout')
    console.log(response.data)
}

const normalLogout = async () => await authStore.logout()

const googleConnect = async() => {
    await authStore.googleConnect()
}

</script>

<template>
	<Header></Header>
	<div class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
		<h3 class="mb-3 text-center">Login</h3>
		<div class="border flex flex-col p-4 space-y-3">
            <p v-if="loginError" class="text-red-600 text-sm mt-1">{{ loginError }}</p>
			<form @submit.prevent="login" class="flex flex-col justify-center space-y-3">
				<label>
					Username :
					<input v-model="username" type="text" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.username" class="text-red-600 text-sm mt-1">{{ errors.username }}</p>
				</label>
				<label>
					Password :
					<input v-model="password" type="password" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
				</label>
                <label>
					token2FA :
					<input v-model="token2FA" type="text" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
				</label>
				<input type="submit" value="Login"
					   class="py-2 px-5 border rounded text-blue-600 shadow-md cursor-pointer">
			</form>
			<hr>
			<button @click="googleConnect" class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">Google</button>
			<button @click="normalLogout" class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">delog</button>
			<button @click="googleLogout" class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">delog google</button>
		</div>
	</div>
</template>
