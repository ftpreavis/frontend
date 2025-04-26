<script lang="ts" setup>
import { useRouter } from "vue-router";

import PongLogo from '../components/Logo.vue'
import Header from '../components/Header.vue'

const router = useRouter()

function chooseGameMode() {
	router.push({name: 'Gamemode'})
}
</script>
<template>
	<div class="bg-[#436B9D] flex flex-col min-h-screen">
		<Header></Header>
		<div class="flex-grow flex justify-center items-center">
			<div class="text-center space-y-4">
				<h1 class="text-8xl text-white font-extrabold font-[Kanit]">| PONG .</h1>
				<p class="text-white font-[Kanit] w-[300px] mx-auto text-lg">The game you’ve always dreamed of and undoubtedly Game of the Year.</p>
				<button
					@click="chooseGameMode"
					class="font-[Kanit] text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-20 py-4 text-center me-2 mb-2"
				>
					PLAY
				</button>
			</div>
<!--			<PongLogo></PongLogo>-->
		</div>
	</div>
</template>

<style>
</style>
