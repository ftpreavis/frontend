import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue"
import router from '@/router'
import axios from 'axios'

const getCookie = (name: string): string | null => {
	const cookies = document.cookie.split('; ')
	const entry = cookies.find(cookie => cookie.startsWith(name + '='))
	return entry ? entry.split('=')[1] : null
}

export const useAuth = defineStore('auth', () => {
	const user = ref(null)
	const userId = ref<number | null>(Number(getCookie('userId')))
	const token = ref<string | null>(getCookie('access_token'))
	const loginError = ref<string>('')
	const isAuthenticated = ref<boolean>(!!token.value)

	const setCookies = (name: string, value: string) => {
		const d = new Date();
		d.setTime(d.getTime() + 7 * 1 * 24 * 60 * 60 * 1000);
		document.cookie = name + "=" + value + "; expires=" + d + "; path=/" + "; samesite=Lax"
	}

	const authenticate = async (username: string, password: string) => {
		try {
			const response = await axios.post('/api/auth/login', { identifier: username, password });
            console.log(response)
            if (response.data.requires2FA) {
                return response.data.requires2FA
            }
            setCookies("access_token", response.data.token)
			const userData = await axios.get('/api/users/profile')
			setCookies('userId', String(userData.data.id))
			await router.push('/').then(() => {window.location.reload()})
		} catch (error){
			loginError.value = "Nom d'utilisateur ou mot de passe incorect"
			console.log("Nom d'utilisateur ou mot de passe incorect" + error)
		}
		console.log('dasd')
	}

    const authenticate2FA = async (id: string, token2FA: string) => {
        const response2FA = await axios.post('/api/auth/2fa/login', {id: id, token: token2FA})
        console.log(response2FA)
        setCookies("access_token", response2FA.data.token)
        const userData = await axios.get('/api/users/profile')
        setCookies('userId', String(userData.data.id))
        await router.push('/').then(() => {window.location.reload()})
    }

	const fetchUserById = async (id: number) => {
		try {
			const { data } = await axios.get(`/api/users/profile/${id}`, {
				headers: { Authorization: `Bearer ${token.value}` }
			})
			user.value = data
			return data
		} catch {
			user.value = null
			return null
		}
	}

	const googleConnect = async () => {
		try {
            axios.get('/api//auth/google/callback')
			window.location.href = '/api/auth/google'
			isAuthenticated.value = true
		} catch {
			loginError.value = "Erreur de connexion avec Google"
		}
	}

	const logout = async () => {
		await axios.get('/api/auth/normalLogout')
		document.cookie = [
			'access_token=',
			'expires=0',
			'path=/',
			'samesite=Lax'
		].join('; ')
		document.cookie = 'userId=; path=/; Max-Age=0; SameSite=Lax'
		user.value = null
		token.value = null
		isAuthenticated.value = false
		userId.value = null
		await router.push('/').then(() => {window.location.reload()})
	}

	return {
		user,
		userId,
		isAuthenticated,
		token,
		loginError,
		googleConnect,
		logout,
		authenticate,
        authenticate2FA,
		fetchUserById
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}
