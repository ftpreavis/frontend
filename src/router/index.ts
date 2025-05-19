import { createRouter, createWebHistory } from 'vue-router'
// import Home from '@/views/Home.vue'
import LandingPage from "@/views/LandingPage.vue";
import Pong from '@/views/Pong.vue'
import ChooseGameMode from '@/views/ChooseGameMode.vue'
import Login from '@/views/Login.vue'
import SignUp from '@/views/SignUp.vue'
import Profile from '@/views/Profile.vue'
import { useAuth } from '@/store/auth.ts'

const routes = [
	{ path: '/', name: 'LandingPage', component: LandingPage },
	{ path: '/gamemode', name: 'Gamemode', component: ChooseGameMode },
	{ path: '/pong', name: 'Pong', component: Pong },
	{ path: '/login', name: 'Login', component: Login },
	{ path: '/signup', name: 'SignUp', component: SignUp },
	{ path: '/profile/:userId', name: 'Profile', component: Profile, meta: { requiresAuth: true, props: true } },
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
