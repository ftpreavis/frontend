// import './assets/main.css'
import './assets/tailwind.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createI18n } from 'vue-i18n'

const messages = {
	en: {
		pongGameDesc: "Old game",
		pacManDesc: "Classical PacMan game",
		topTag: "TOP RATED",
		newTag: "NEW !"
	},
	fr: {
		pongGameDesc: "Vieux jeu",
		pacManDesc: "Jeu classique PacMan",
		topTag: "MIEUX NOTE",
		newTag: "NOUVEAU !"
	}
}

const i18h = createI18n({
	legacy: false,
	locale: 'fr',
	messages
})

const app = createApp(App).use(router).use(i18h).mount('#app')
