<script lang="ts" setup>
import {ref, onMounted} from 'vue'
import Header from '/src/components/Header.vue'

const leftY = ref(0)
const rightY = ref(0)
const speed = 10
const boardHeight = 500

onMounted(() => {
	const mid = (boardHeight - 128) / 2
	leftY.value = mid
	rightY.value = mid
})

function onKeyDown(e) {
	if (e.key === 'w' || e.key === 'W') {
		leftY.value = Math.max(0, leftY.value - speed)
	}
	if (e.key === 's' || e.key === 'S') {
		leftY.value = Math.min(boardHeight - 128, leftY.value + speed)
	}
	if (e.key === 'ArrowUp') {
		rightY.value = Math.max(0, rightY.value - speed)
	}
	if (e.key === 'ArrowDown') {
		rightY.value = Math.min(boardHeight - 128, rightY.value + speed)
	}
}

</script>

<template>
	<Header></Header>
	<div class="bg-[#436B9D] flex flex-col h-screen justify-center space-y-5">
		<h1 class="text-8xl lg:text-9xl font-[Kanit] text-center font-bold text-white ">| P0NG .</h1>
		<div
			class="bg-[#436B9D] relative h-[500px] w-[650px] lg:w-[800px] border-4 overflow-hidden mx-auto"
			tabindex="0"
			@keydown="onKeyDown"
		>
			<div class="absolute top-4 left-10 right-10 flex items-center justify-between text-white font-bold text-4xl lg:text-5xl font-[Kanit]">
				<span>0</span>
				<span>2</span>
			</div>
			<div class="absolute h-full border-l-2 border-white border-dashed left-1/2 transform -translate-x-1/2"></div>
			<div class="absolute left-4 w-4 h-32 bg-white" :style="{ top: `${leftY}px` }"></div>
			<div class="absolute right-4 w-4 h-32 bg-white" :style="{ top: `${rightY}px` }"></div>
			<div class="absolute w-4 h-4 bg-white rounded-xl top-[250px] left-[200px]"></div>
		</div>
	</div>
</template>
