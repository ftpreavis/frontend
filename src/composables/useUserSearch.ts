import { ref } from 'vue'
import axios from 'axios'

export function useUserSearch() {
	const searchQuery = ref('')
	const searchResults = ref<any[]>([])
	const loading = ref(false)
	const error = ref<string | null>(null)

	const search = async () => {
		if (!searchQuery.value.trim()) return
		loading.value = true
		error.value = null

		try {
			const { data } = await axios.get(`/api/users/search?q=${encodeURIComponent(searchQuery.value)}`)
			searchResults.value = data
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
