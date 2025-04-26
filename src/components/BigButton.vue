<script lang="ts" setup>

import { useRouter } from "vue-router";

const router = useRouter()

function runGame() {
	router.push({name: 'Game'})
}

</script>

<template>
	<button class="bg-[#3589D7] font-[Kanit] text-white p-[20px] rounded-xl shadow-lg" @click="runGame">
		<slot />
	</button>
</template>
