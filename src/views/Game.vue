<script lang="ts" setup>
// import Header from '@/components/Header.vue'
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const pongCanvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const basePaddleHeight = 100
const paddleWidth = 40
let paddleHeight = basePaddleHeight
let player1Pos = 0
let player2Pos = 0
const basePlayerSpeed = 6
let playerSpeed = basePlayerSpeed
const refWidth = 430
const canvasWidth = ref(0)
const canvasHeight = ref(0)
const player1Score = ref(0)
const player2Score = ref(0)

const ballRaduis = 15
let ballPosX = 0
let ballPosY = 0
const basePaddleSpeed = 3
let initialPaddleSpeed = 0
let ballSpeedX = basePaddleSpeed
let ballSpeedY = basePaddleSpeed
const speedBoost = 1.00
let isWaiting = false
const message = ref<string>('')
// window.innerHeight > window.innerWidth
const gameState = reactive({
	isPortrait: true
})

const detectOrientation = () => {
	// gameState.isPortrait = window.innerHeight > window.innerWidth
	// gameState.isPortrait = true
	updateCanvasDimensions()
}

const updateCanvasDimensions = () => {
	if (pongCanvas.value) {
		const rect = pongCanvas.value.getBoundingClientRect()
		canvasWidth.value = rect.width
		canvasHeight.value = rect.height
		pongCanvas.value.width = canvasWidth.value
		pongCanvas.value.height = canvasHeight.value
		playerSpeed = basePlayerSpeed * Math.sqrt(canvasWidth.value / refWidth)
		initialPaddleSpeed = basePaddleSpeed * Math.sqrt(canvasWidth.value / refWidth)
		paddleHeight = basePaddleHeight * Math.sqrt(canvasWidth.value / refWidth)
		player1Pos = canvasWidth.value / 2 - (paddleHeight / 2)
		player2Pos = canvasWidth.value / 2 - (paddleHeight / 2)
		ballPosX = canvasWidth.value / 2
		ballPosY = canvasHeight.value / 2
	}
}

onMounted(() => {
	const canvas = pongCanvas.value
	if (canvas) {
		ctx.value = canvas.getContext('2d')
		if (ctx.value) {
			updateCanvasDimensions()
			console.log(canvasWidth.value)
			canvas.width = canvasWidth.value
			canvas.height = canvasHeight.value
			player1Pos = (canvasWidth.value - paddleHeight) / 2
			player2Pos = (canvasWidth.value - paddleHeight) / 2
			ballPosX = (canvasWidth.value - ballRaduis) / 2
			ballPosY = (canvasHeight.value - ballRaduis) / 2
			resetBall(1)
			gameLoop()
		}
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
		if (event.key === 'a') leftKey1 = true
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
		if (event.key === 'a') leftKey1 = false
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
		if (rightKey1 && player1Pos < canvasWidth.value - paddleHeight - 5) player1Pos += playerSpeed

		if (leftKey2 && player2Pos > 0) player2Pos -= playerSpeed
		if (rightKey2 && player2Pos < canvasWidth.value - paddleHeight - 5) player2Pos += playerSpeed
	} else {
		if (upKey1 && player1Pos > 0) player1Pos -= playerSpeed
		if (downKey1 && player1Pos < canvasHeight.value - paddleHeight) player1Pos += playerSpeed

		if (upKey2 && player2Pos > 0) player2Pos -= playerSpeed
		if (downKey2 && player2Pos < canvasHeight.value - paddleHeight) player2Pos += playerSpeed
	}
}

const updateBallPosition = () => {
	ballPosX += ballSpeedX
	ballPosY += ballSpeedY

	if (ballPosX - ballRaduis <= 0 || ballPosX + ballRaduis >= canvasWidth.value) {
		ballSpeedX = -ballSpeedX

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (ballPosY + ballRaduis >= canvasHeight.value - paddleWidth && (ballPosX >= player2Pos && ballPosX <= player2Pos + paddleHeight)) {
		ballSpeedY = -ballSpeedY
		ballPosY = canvasHeight.value - paddleWidth - ballRaduis

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX + ballRaduis >= player2Pos &&
		ballPosX - ballRaduis < player2Pos &&
		ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballSpeedX = -Math.abs(ballSpeedX);
		ballPosX   = player2Pos - ballRaduis;

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX - ballRaduis <= player2Pos + paddleHeight &&
		ballPosX + ballRaduis > player2Pos + paddleHeight && ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballSpeedX = Math.abs(ballSpeedX);
		ballPosX   = player2Pos + paddleHeight + ballRaduis;

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}




	if (ballPosY - ballRaduis <= paddleWidth && (ballPosX >= player1Pos && ballPosX <= player1Pos + paddleHeight)){
		ballSpeedY = -ballSpeedY

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX + ballRaduis >= player1Pos &&
		ballPosX - ballRaduis < player1Pos &&
		ballPosY - ballRaduis <= paddleWidth &&
		ballPosY + ballRaduis >= 0
	) {
		ballSpeedX = -Math.abs(ballSpeedX)
		ballPosX   = player1Pos - ballRaduis

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX - ballRaduis <= player1Pos + paddleHeight &&
		ballPosX + ballRaduis > player1Pos + paddleHeight &&
		ballPosY - ballRaduis <= paddleWidth &&
		ballPosY + ballRaduis >= 0
	) {
		ballSpeedX = Math.abs(ballSpeedX)
		ballPosX   = player1Pos + paddleHeight + ballRaduis

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}


	if (ballPosY <= 0) {
		player2Score.value++
		message.value = 'Player 2 scored !'
		resetBall(1)
	}
	if (ballPosY >= canvasHeight.value) {
		player1Score.value++
		message.value = 'Player 1 scored !'
		resetBall(2)
	}

}

const resetBall = (server: 1 | 2) => {
	ballSpeedX = 0
	ballSpeedY = 0
	ballPosX = canvasWidth.value / 2
	ballPosY = canvasHeight.value / 2
	isWaiting = true
	setTimeout(() => {
		const maxX = initialPaddleSpeed * 0.8
		const minX = initialPaddleSpeed * 0.2
		const sign = Math.random() < 0.5 ? 1 : -1
		const absX = minX + Math.random() * (maxX - minX)
		ballSpeedX = sign * absX
		ballSpeedY = server === 2 ? -initialPaddleSpeed : initialPaddleSpeed
		isWaiting = false
		message.value = ''
	}, 1000)
}

const drawBall = () => {
	if (ctx.value) {
		ctx.value.fillStyle = 'white'
		ctx.value.beginPath()
		ctx.value.arc(ballPosX, ballPosY, ballRaduis, 0, Math.PI * 2)
		ctx.value.fill()
		ctx.value.closePath()
	}
}

const drawScores = () => {
	if (ctx.value) {
		ctx.value.save()
		ctx.value.font = '50px sans-serif'
		ctx.value.fillStyle = '#fff'
		ctx.value.textAlign = 'center'

		ctx.value.fillText(
			player1Score.value.toString(),
			canvasWidth.value / 2,
			100
		)

		ctx.value.fillText(
			player2Score.value.toString(),
			canvasWidth.value / 2,
			canvasHeight.value - 65
		)

		ctx.value.restore()
	}
}

const drawMessage = () => {
	if (ctx.value)
	{
		ctx.value.save()
		ctx.value.font = '40px sans-serif'
		ctx.value.fillStyle = 'yellow'
		ctx.value.textAlign = 'center'

		ctx.value.fillText(
			message.value,
			canvasWidth.value / 2,
			canvasHeight.value / 2 - 20
		)
		ctx.value.restore()
	}
}

const drawDivider = () => {
	if (ctx.value)
	{
		ctx.value.save();
		ctx.value.strokeStyle = 'white'
		ctx.value.lineWidth = 2
		ctx.value.setLineDash([10, 10])
		ctx.value.beginPath()
		ctx.value.moveTo(0, canvasHeight.value / 2)
		ctx.value.lineTo(canvasWidth.value, canvasHeight.value / 2)
		ctx.value.stroke()
		ctx.value.restore()
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
	if (!isWaiting)
		updateBallPosition()
	drawPaddles()
	drawDivider()
	drawBall()
	drawScores()
	if (isWaiting && message.value)
		drawMessage()
	requestAnimationFrame(gameLoop)
}
</script>

<template>
<!--	<Header></Header>-->
	<div class="flex flex-col min-h-screen">
		<div>

		</div>
		<div class="w-[95%] h-[100vh] relative flex  bg-gray-800 mx-auto rounded-xl py-3">
			<canvas ref="pongCanvas" class="w-full h-full"></canvas>
		</div>
	</div>
</template>
