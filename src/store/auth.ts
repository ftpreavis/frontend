import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue"
import router from '@/router'
import axios from 'axios'
import { useLang } from '@/composables/useLang'

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
	const signupError = ref<string>('')
	const { t } = useLang()
	const isAuthenticated = ref<boolean>(!!token.value)
	const userMap = ref<Record<number, { id: number; username: string; avatar?: string }>>({})


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
			loginError.value = t('error.auth.invalidCredentials')
			console.log(loginError.value)
		}
	}

	const signup = async (username: string, email: string, password: string) => {
		try {
			const response = await axios.post('/api/auth/signup', {
				username: username,
				password: password,
				email: email,
			})
			const userData = await axios.get('/api/users/profile')
			setCookies('userId', String(userData.data.id))
			await router.push('/').then(() => {window.location.reload()})
		} catch (error: any) {
			const msg = error.response.data.error
			if (msg.includes('User already exists'))
				signupError.value = t('error.signup.alreadyExists')
		}
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
		if (userMap.value[id]) return userMap.value[id];

		try {
			const { data } = await axios.get(`/api/users/profile/${id}`, {
				headers: { Authorization: `Bearer ${token.value}` }
			});
			userMap.value[id] = data;
			return data;
		} catch {
			return null;
		}
	}


	const googleConnect = async () => {
		try {
            axios.get('/api//auth/google/callback')
			window.location.href = '/api/auth/google'
			isAuthenticated.value = true
		} catch {
			loginError.value = t('error.auth.googleAuthFailed')
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
		userMap,
		googleConnect,
		logout,
		authenticate,
        authenticate2FA,
		fetchUserById,
		signup,
		signupError
	}
})

if (import.meta.hot) {
	import.meta.hot.accept(acceptHMRUpdate(useAuth, import.meta.hot))
}
