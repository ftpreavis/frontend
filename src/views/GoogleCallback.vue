<script setup lang="ts">
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { useAuth } from '@/store/auth'

const route = useRoute()
const auth = useAuth()

onMounted(() => {
	const code = route.query.code as string
	if (code) {
		console.log("[Google OAuth] Code reçu :", code)
		auth.googleCallback(code)
	} else {
		console.warn("[Google OAuth] Aucun code reçu.")
	}
})
</script>

<template>
	<p>Connexion en cours...</p>
</template>
