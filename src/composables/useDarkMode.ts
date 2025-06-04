import { ref, watch, onMounted } from 'vue'
import { useAuth } from '@/store/auth'
import axios from 'axios'

export function useDarkMode() {
	const stored = localStorage.getItem('theme')
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
	const theme = ref<string>(stored || (prefersDark ? 'dark' : 'light'))
    const authStore = useAuth()

	const apply = (val: string) => {
		const html = document.documentElement
		if (val === 'dark') html.classList.add('dark')
		else html.classList.remove('dark')
		localStorage.setItem('theme', val)
	}

	const toggle = async() => {
		theme.value = theme.value === 'light' ? 'dark' : 'light'
        await axios.patch(`/api/users/${authStore.userId}/settings`, {darkMode: theme.value})
	}

	watch(theme, apply)
	onMounted(() => apply(theme.value))

	return { theme, toggle }
}
