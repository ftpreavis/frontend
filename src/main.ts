// import './assets/main.css'
import './assets/tailwind.css';

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from "pinia";
import axios from 'axios'
import Vue3Toasity from 'vue3-toastify';
import i18n from '@/lang/lang'

axios.defaults.withCredentials = true

const app = createApp(App).use(router).use(i18n).use(createPinia()).use(Vue3Toasity, {limit: 2}).mount('#app')
