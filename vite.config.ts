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
			// '/api/chat': {
			// 	// 2️⃣ Ta vraie URL back
			// 	target: 'http://localhost:5432',
			// 	changeOrigin: true,
			// 	secure: false,
			// 	// 3️⃣ On réécrit /api/chat/... → /chat/...
			// 	rewrite: (path) => path.replace(/^\/api\/chat/, '/chat')
			// }
		},
	}
})
