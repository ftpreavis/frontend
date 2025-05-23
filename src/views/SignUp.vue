<script lang="ts" setup>
import router from '@/router';
import axios from 'axios'
import { onMounted, ref } from 'vue'
import Header from "@/components/Header.vue";

const username = ref<string>('')
const password = ref<string>('')
const email = ref<string>('')
const errors = ref<{username?: string; password?: string; email?: string}>({})

const signup = async () => {
    errors.value = {}
    if (!username.value){
        errors.value.username = "Le nom d'utilisateur est requis."
    }
    if (!password.value){
        errors.value.password = "Le mot de passe est requis."
    }
    if (!email.value){
        errors.value.email = "L'email est requis."
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
	<div class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
		<h3 class="mb-3 text-center">Sign Up</h3>
		<div class="border flex flex-col p-4 space-y-3">
			<form @submit.prevent="signup" class="flex flex-col justify-center space-y-3">
				<label>
					Username :
					<input v-model="username" type="text" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.username" class="text-red-600 text-sm mt-1">{{ errors.username }}</p>
				</label>
                <label>
					Email :
					<input v-model="email" type="email" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.email" class="text-red-600 text-sm mt-1">{{ errors.email }}</p>
				</label>
				<label>
					Password :
					<input v-model="password" type="password" class="border-2 rounded h-8 w-full">
                    <p v-if="errors.password" class="text-red-600 text-sm mt-1">{{ errors.password }}</p>
				</label>
				<input type="submit" value="Sign up"
					   class="py-2 px-5 border rounded text-blue-600 shadow-md cursor-pointer">
			</form>
			<hr>
			<button @click="googleConnect" class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">Google</button>
		</div>
	</div>
</template>
