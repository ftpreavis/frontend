<script lang="ts" setup>
import { useRouter } from "vue-router";
import background from '@/assets/bg_home.png'

import PongLogo from '/src/components/Logo.vue'
import Header from '/src/components/Header.vue'

const router = useRouter()
const bgUrl = background

function startGame() {
	router.push({name: 'Game'})
}
</script>
<!--:style="{ backgroundImage: `url(${bgUrl})`}" class="w-full h-screen bg-image"-->
<template>
	<div style="background-color: #436B9D" class="flex flex-col min-h-screen">
		<Header></Header>
		<div class="flex-grow flex justify-center items-center">
			<div class="text-center mr-10">
				<h1 class="text-8xl text-white font-extrabold font-[Kanit]">PONG</h1>
				<p class="text-white font-[Kanit] mb-4">Lorem ipsum</p>
				<button
					@click="startGame"
					class="font-[Kanit] text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
				>
					PLAY
				</button>
			</div>
			<PongLogo></PongLogo>
		</div>
	</div>
</template>

<style>
</style>
