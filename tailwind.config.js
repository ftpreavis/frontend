/** @type {import('tailwindcss').Config} */
export default {
	content: [
	  "./index.html",
	  "./src/**/*.{vue,js,ts,jsx,tsx}",
	],
	darkMode: 'class',
	theme: {
	  extend: {
		  backgroundImage: {
			  'home_bg': "url('/src/assets/bg_home.png')"
		  }
	  },
	},
	plugins: [],
  }
