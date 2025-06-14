import { ref } from 'vue'
import axios from 'axios'
import { useAuth } from '@/store/auth'

export function useUserSearch() {
	const searchQuery = ref('')
	const searchResults = ref<any[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)
	const authStore = useAuth()

	const search = async () => {
		if (!searchQuery.value.trim()) return
		loading.value = true
		error.value = null

		try {
			const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery.value)}`)
			searchResults.value = data.filter((user: any) => user.id !== authStore.userId)
		} catch (err: any) {
			console.error('[Search] Failed:', err)
			error.value = err.response?.data?.error || err.message
		} finally {
			loading.value = false
		}
	}

	return {
		searchQuery,
		searchResults,
		loading,
		error,
		search,
	}
}
