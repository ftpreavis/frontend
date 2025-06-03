import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/views/Home.vue'
import LandingPage from "@/views/LandingPage.vue";
import Pong from '@/views/Pong.vue'
import Profile from '@/views/Profile.vue'
import ChatPage from "@/views/ChatPage.vue";
import { useAuth } from '@/store/auth.ts'

const routes = [
	{ path: '/', name: 'LandingPage', component: LandingPage },
	{ path: '/pong', name: 'Pong', component: Pong },
	{ path: '/profile/:userId', name: 'Profile', component: Profile, meta: { requiresAuth: true, props: true } },
	{ path: '/chat', name: 'ChatPage', component: ChatPage, meta: { requiresAuth: true, props: true } }
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

router.beforeEach((to, from, next) => {
	const userStore = useAuth()
	// console.log(userStore.userId)
	if (to.meta.requiresAuth && !userStore.isAuthenticated) {
		next('/login')
	} else {
		next()
	}
})

export default router
