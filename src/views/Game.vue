<script lang="ts" setup>
import Header from '@/components/Header.vue'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const pongCanvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref(null)
const paddleWidth = 10
const paddleHeight = 100
let player1Pos = 0
let player2Pos = 0
const playerSpeed = 15
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const gameState = reactive({
	isPortrait: window.innerHeight > window.innerWidth
})

const detectOrientation = () => {
	gameState.isPortrait = window.innerHeight > window.innerWidth
	updateCanvasDimensions()
}

const updateCanvasDimensions = () => {
	if (pongCanvas.value) {
		const rect = pongCanvas.value.getBoundingClientRect()
		canvasWidth.value = rect.width
		canvasHeight.value = rect.height
	}
}

onMounted(() => {
	const canvas = pongCanvas.value
	ctx.value = canvas.getContext('2d')
	if (ctx.value) {
		updateCanvasDimensions()
		console.log(canvasWidth.value)
		canvas.width = canvasWidth.value
		canvas.height = canvasHeight.value
		gameLoop()
	}

	window.addEventListener('resize', detectOrientation)
	window.addEventListener('keydown', handleKeyDown)
	window.addEventListener('keyup', handleKeyUp)
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', detectOrientation)
	window.removeEventListener('keydown', handleKeyDown)
	window.removeEventListener('keyup', handleKeyUp)
})

let upKey1 = false
let downKey1 = false
let upKey2 = false
let downKey2 = false
let leftKey1 = false
let rightKey1 = false
let leftKey2 = false
let rightKey2 = false

const handleKeyDown = (event: KeyboardEvent) => {
	if (gameState.isPortrait) {
		if (event.key === 'q') leftKey1 = true
		if (event.key === 'w') rightKey1 = true
		if (event.key === 'ArrowLeft') leftKey2 = true
		if (event.key === 'ArrowRight') rightKey2 = true
	} else {
		if (event.key === 'w') upKey1 = true
		if (event.key === 's') downKey1 = true
		if (event.key === 'ArrowUp') upKey2 = true
		if (event.key === 'ArrowDown') downKey2 = true
	}
}

const handleKeyUp = (event: KeyboardEvent) => {
	if (gameState.isPortrait) {
		if (event.key === 'q') leftKey1 = false
		if (event.key === 'w') rightKey1 = false
		if (event.key === 'ArrowLeft') leftKey2 = false
		if (event.key === 'ArrowRight') rightKey2 = false
	} else {
		if (event.key === 'w') upKey1 = false
		if (event.key === 's') downKey1 = false
		if (event.key === 'ArrowUp') upKey2 = false
		if (event.key === 'ArrowDown') downKey2 = false
	}
}

const updatePaddlesPosition = () => {
	if (gameState.isPortrait) {
		if (leftKey1 && player1Pos > 0) player1Pos -= playerSpeed
		if (rightKey1 && player1Pos < canvasWidth.value - paddleHeight - 10) player1Pos += playerSpeed

		if (leftKey2 && player2Pos > 0) player2Pos -= playerSpeed
		if (rightKey2 && player2Pos < canvasWidth.value - paddleHeight - 10) player2Pos += playerSpeed
	} else {
		if (upKey1 && player1Pos > 0) player1Pos -= playerSpeed
		if (downKey1 && player1Pos < canvasHeight.value - paddleHeight) player1Pos += playerSpeed

		if (upKey2 && player2Pos > 0) player2Pos -= playerSpeed
		if (downKey2 && player2Pos < canvasHeight.value - paddleHeight) player2Pos += playerSpeed
	}
}

const drawPaddles = () => {
	if (ctx.value) {
		ctx.value.fillStyle = 'red'
		ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
		if (gameState.isPortrait) {
			ctx.value.fillRect(player1Pos, 0, paddleHeight, paddleWidth)
			ctx.value.fillRect(player2Pos, canvasHeight.value - paddleWidth, paddleHeight, paddleWidth)
		} else {
			ctx.value.fillRect(0, player1Pos, paddleWidth, paddleHeight)
			ctx.value.fillRect(canvasWidth.value - paddleWidth, player2Pos, paddleWidth, paddleHeight)
		}
	}
}

const gameLoop = () => {
	updatePaddlesPosition()
	drawPaddles()
	requestAnimationFrame(gameLoop)
}
</script>

<template>
	<Header></Header>
	<div class="flex flex-col min-h-screen">
		<div>

		</div>
		<div class="w-[95%] h-[70vh] relative flex  bg-gray-800 mx-auto rounded-xl py-3 mt-3">
			<canvas ref="pongCanvas" class="w-full h-full"></canvas>
		</div>
	</div>
</template>
