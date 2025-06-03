import { ref, watch, onMounted } from 'vue'

export function useDarkMode() {
	const stored = localStorage.getItem('theme')
	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
	const theme = ref<string>(stored || (prefersDark ? 'dark' : 'light'))

	const apply = (val: string) => {
		const html = document.documentElement
		if (val === 'dark') html.classList.add('dark')
		else html.classList.remove('dark')
		localStorage.setItem('theme', val)
	}

	const toggle = () => {
		theme.value = theme.value === 'light' ? 'dark' : 'light'
	}

	watch(theme, apply)
	onMounted(() => apply(theme.value))

	return { theme, toggle }
}
