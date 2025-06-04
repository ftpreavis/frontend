<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted, watch } from 'vue'
import { useAuth } from '@/store/auth'
import { useRouter } from 'vue-router'

const route = useRoute()
const auth = useAuth()
const router = useRouter()

onMounted(async () => {
	const code = route.query.code as string
	if (code) {
		console.log("[Google OAuth] Code reçu :", code)
		const success = await auth.googleCallback(code)
		if (success) {
			await router.push('/')
			window.location.reload()
		}
	} else {
		console.warn("[Google OAuth] Aucun code reçu.")
	}
})

// watch(
// 	auth.user,
// 	() => {
// 		router.push('/')
// 	}
// )
</script>

<template>
	<p>Connexion en cours...</p>
</template>
