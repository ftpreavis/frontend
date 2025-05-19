import { defineStore } from "pinia";
import { ref } from "vue"
import router from '@/router'
import axios from 'axios'

export const useAuth = defineStore('auth', () => {
	const user = ref(null)
	const token = ref<string | null>(localStorage.getItem('token'))
	const loginError = ref<string>('')
	const isAuthenticated = ref<boolean>(!!token.value)

	const authenticate = async (username: string, password: string) => {
		try {
			// const response = await axios.post('/api/auth/login', {
			// 	identifier: username,
			// 	password: password
			// })
			// localStorage.setItem('token', response.data.tokens)
			// localStorage.setItem('userId', JSON.stringify(response.data.user.id))
			// userId.value = response.data.user.id
			// console.log(response.data)
			// user.value = response.data.user
			// token.value = response.data.tokens
			// isAuthenticated.value = true
			const response = await axios.post('/api/auth/login', { identifier: username, password });
			console.log('Login response:', response.data);
			localStorage.setItem('token', response.data.tokens)
			await router.push('/')
		} catch (error){
			loginError.value = "Nom d'utilisateur ou mot de passe incorect"
			console.log("Nom d'utilisateur ou mot de passe incorect" + error)
		}
	}

	// const fetchUser = async () => {
	// 	if (!token.value || !userId.value) return
	//
	// 	try {
	// 		const { data } = await axios.get(`/api/users/${userId.value}`, {
	// 			headers: { Authorization: `Bearer ${token.value}` }
	// 		})
	// 		user.value = data
	// 		isAuthenticated.value = true
	// 	} catch {
	// 		logout()
	// 	}
	// }

	const googleConnect = async () => {
		try {
			window.location.href = '/api/auth/google'
			isAuthenticated.value = true
		} catch {
			loginError.value = "Erreur de connexion avec Google"
		}
	}

	const logout = () => {
		localStorage.removeItem('token')
		localStorage.removeItem('userId')
		// user.value = null
		token.value = null
		isAuthenticated.value = false
		// userId.value = null
	}

	return {
		user,
		isAuthenticated,
		token,
		loginError,
		googleConnect,
		logout,
		authenticate,
	}
})
