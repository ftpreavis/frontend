import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Pong from '@/views/Pong.vue'
import ChooseGameMode from '@/views/ChooseGameMode.vue'
import Login from '@/views/Login.vue'
import SignUp from '@/views/SignUp.vue'
import Profile from '@/views/Profile.vue'

const routes = [
	{ path: '/', name: 'Home', component: Home },
	{ path: '/gamemode', name: 'Gamemode', component: ChooseGameMode },
	{ path: '/pong', name: 'Pong', component: Pong },
	{ path: '/login', name: 'Login', component: Login},
    { path: '/signup', name: 'SignUp', component: SignUp},
	{ path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true }}
]

export default createRouter({
	history: createWebHistory(),
	routes,
})

// router.beforeEach((to, from, next) => {
// 	const userStore =
// })
