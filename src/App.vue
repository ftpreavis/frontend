<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useSocket } from '@/sockets/socket'
import { setupChatSocket } from '@/sockets/handlers/chat'
import { useAuth } from '@/store/auth'
import { useRoute } from 'vue-router'
import { useChat } from '@/store/chat'
import Header from '@/components/Header.vue'

const authStore = useAuth()
const route = useRoute()
const chatStore = useChat()

onMounted(async () => {
	if (authStore.userId) {
		const socket = useSocket()
		socket.connect()
		setupChatSocket()

		await Promise.all([
			chatStore.loadConversations(authStore.userId),
			chatStore.loadUnread(authStore.userId)
		])

	}
})

watch(
  () => route.path,
  (newPath) => {
    if (!newPath.startsWith('/chat')) {
      chatStore.setSelectedUser(null)
    }
  }
)
</script>

<template>
    <div class="flex flex-col h-screen overflow-hidden">
      <Header />
      <main class="flex-1 overflow-hidden">
        <RouterView />
      </main>
    </div>
  </template>

<style scoped></style>
