import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Game from '@/views/Game.vue'
import ChooseGameMode from '@/views/ChooseGameMode.vue'
import Login from '@/views/Login.vue'

const routes = [
	{ path: '/', name: 'Home', component: Home },
	{ path: '/gamemode', name: 'Gamemode', component: ChooseGameMode },
	{ path: '/game', name: 'Game', component: Game },
	{ path: '/login', name: 'Login', component: Login}
]

export default createRouter({
	history: createWebHistory(),
	routes,
})
