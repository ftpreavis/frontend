import { defineStore } from "pinia";
import { ref } from "vue"
import axios from 'axios'
import router from '@/router'

export const useAuth = defineStore('auth', () => {
	const user = ref(null)
	const token = ref<string | null>(localStorage.getItem('token'))
	const loginError = ref<string>('')
	const authenticate = async (username: string, password: string) => {
		try {
			const response = await axios.post('/api/auth/login', {
				identifier: username,
				password: password
			})
			localStorage.setItem('token', response.data.tokens)
			user.value = response.data.user
			token.value = response.data.tokens
			await router.push('/')
		} catch {
			loginError.value = "Nom d'utilisateur ou mot de passe incorect"
			console.log("Nom d'utilisateur ou mot de passe incorect")
		}
	}

	const googleConnect = async () => {
		try {
			window.location.href = '/api/auth/google'
		} catch {
			loginError.value = "Erreur de connexion avec Google"
		}
	}

	const logout = () => {
		localStorage.removeItem('token')
		user.value = null
		token.value = null
		router.push('/login')
	}

	return {
		user,
		token,
		loginError,
		googleConnect,
		logout,
		authenticate
	}
})
