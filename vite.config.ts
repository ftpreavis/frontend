import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		vueDevTools(),
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		},
	},
	server: {
		allowedHosts: true, // DO NOT TOUCH, REVERSE PROXY FOR API
		host: '0.0.0.0',
		port: 5173,
		proxy: {
			'/api': {
				target: 'http://gateway-service:3000', // docker internal name
				changeOrigin: true,
				rewrite: path => path.replace(/^\/api/, ''),
			},
			'/socket/chat': {
				target: 'http://chat-service:3000',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/socket\/chat/, '')
			},
			'/socket/lobby': {
				target: 'http://lobby-service:3000',
				changeOrigin: true,
				rewrite: path => path.replace(/^\/socket\/lobby/, '')
			}
		},
	}
})
