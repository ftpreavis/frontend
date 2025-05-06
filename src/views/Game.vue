<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Settings from '@/components/PongSettings.vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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

const ballRadius = 15
let ballPosX = 0
let ballPosY = 0
const basePaddleSpeed = 3
let initialPaddleSpeed = 0
let ballSpeedX = basePaddleSpeed
let ballSpeedY = basePaddleSpeed
const speedBoost = 1.05
let isWaiting = false
const message = ref<string>('')
const gameMode = ref<string | null>(null)
let botInterval: number

let player1Name = ref<string>('IA')
let player2Name = ref<string>('Azaleee')

const showSettings = ref(false)
const settings = ref({
	background: '#1F2937',
	paddle: 	'#FF0000',
	ball: 		'#FFFFFF',
	divider:	'#FFFFFF',
	score:		'#FFFFFF'
})

watch(settings, () => {
	nextTick(render)
}, { deep: true })

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
		render()
	}
}

onMounted(() => {
	const canvas = pongCanvas.value
	if (canvas) {
		ctx.value = canvas.getContext('2d')
		if (ctx.value) {
			updateCanvasDimensions()
			canvas.width = canvasWidth.value
			canvas.height = canvasHeight.value
			player1Pos = (canvasWidth.value - paddleHeight) / 2
			player2Pos = (canvasWidth.value - paddleHeight) / 2
			ballPosX = (canvasWidth.value - ballRadius) / 2
			ballPosY = (canvasHeight.value - ballRadius) / 2
			render()
		}
	}

	window.addEventListener('resize', updateCanvasDimensions)
	window.addEventListener('keydown', handleKeyDown)
	window.addEventListener('keyup', handleKeyUp)

	if (pongCanvas.value) {
		pongCanvas.value.addEventListener('touchstart', handleTouchStart, { passive: false })
		pongCanvas.value.addEventListener('touchmove', handleTouchMove, { passive: false })
		pongCanvas.value.addEventListener('touchend', handleTouchEnd, { passive: false })
	}
})

onBeforeUnmount(() => {
	window.removeEventListener('resize', updateCanvasDimensions)
	window.removeEventListener('keydown', handleKeyDown)
	window.removeEventListener('keyup', handleKeyUp)
	if (pongCanvas.value) {
		pongCanvas.value.removeEventListener('touchstart', handleTouchStart)
		pongCanvas.value.removeEventListener('touchmove', handleTouchMove)
		pongCanvas.value.removeEventListener('touchend', handleTouchEnd)
	}
})

function clamp(val: number, min: number, max: number) {
	return Math.max(min, Math.min(max, val))
}

const handleTouchMove = (e: TouchEvent) => {
	e.preventDefault()
	if (!pongCanvas.value) return

	const rect = pongCanvas.value.getBoundingClientRect()

	for (let i = 0; i < e.touches.length; i++) {
		const touch = e.touches[i]
		const x = touch.clientX - rect.left
		const y = touch.clientY - rect.top
		const targetPos = clamp(x - paddleHeight / 2, 0, canvasWidth.value - paddleHeight)
		if (y < canvasHeight.value / 2) {
			if (gameMode.value != 'solo') player1Pos = targetPos
		} else {
			player2Pos = targetPos
		}
	}
}

const handleTouchStart = (e: TouchEvent) => {
	e.preventDefault()
	handleTouchMove(e)
}

const handleTouchEnd = (e: TouchEvent) => {
	e.preventDefault()
}

let leftKey1 = false
let rightKey1 = false
let leftKey2 = false
let rightKey2 = false

const handleKeyDown = (event: KeyboardEvent) => {
	if (event.key === 'a') leftKey1 = true
	if (event.key === 'w') rightKey1 = true
	if (event.key === 'ArrowLeft') leftKey2 = true
	if (event.key === 'ArrowRight') rightKey2 = true
}

const handleKeyUp = (event: KeyboardEvent) => {
	if (event.key === 'a') leftKey1 = false
	if (event.key === 'w') rightKey1 = false
	if (event.key === 'ArrowLeft') leftKey2 = false
	if (event.key === 'ArrowRight') rightKey2 = false
}

const updatePaddlesPosition = () => {
	if (leftKey1 && player1Pos > 0) player1Pos -= playerSpeed
	if (rightKey1 && player1Pos < canvasWidth.value - paddleHeight - 5) player1Pos += playerSpeed

	if (leftKey2 && player2Pos > 0) player2Pos -= playerSpeed
	if (rightKey2 && player2Pos < canvasWidth.value - paddleHeight - 5) player2Pos += playerSpeed
}

const predictBallX = () => {
	const timeToReach = (ballPosY - paddleWidth) / Math.abs(ballSpeedY)
	let predictedX = ballPosX + ballSpeedX * timeToReach

	const fieldWidth = canvasWidth.value
	const period = 2 * (fieldWidth)

	predictedX = predictedX % period
	if (predictedX < 0) predictedX += period
	if (predictedX > fieldWidth) predictedX = period - predictedX
	return predictedX
}

const pong_bot = () => {
    if (targetX > player1Pos + paddleHeight / 5 && targetX < player1Pos + paddleHeight - paddleHeight / 5) {
		leftKey1 = false
		rightKey1 = false
	}
	else if (targetX < player1Pos + paddleHeight / 2) {
		leftKey1 = true
		rightKey1 = false
	} else if (targetX > player1Pos + paddleHeight / 2) {
		rightKey1 = true
		leftKey1 = false
	}
}

const updateBallPosition = () => {
	ballPosX += ballSpeedX
	ballPosY += ballSpeedY

	if (ballPosX - ballRadius <= 0 || ballPosX + ballRadius >= canvasWidth.value) {
		ballSpeedX = -ballSpeedX
	}

	if (ballPosY + ballRadius >= canvasHeight.value - paddleWidth && (ballPosX >= player2Pos && ballPosX <= player2Pos + paddleHeight)) {
		ballSpeedY = -ballSpeedY
		ballPosY = canvasHeight.value - paddleWidth - ballRadius

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX + ballRadius >= player2Pos &&
		ballPosX - ballRadius < player2Pos &&
		ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballSpeedX = -Math.abs(ballSpeedX);
		ballPosX   = player2Pos - ballRadius;

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX - ballRadius <= player2Pos + paddleHeight &&
		ballPosX + ballRadius > player2Pos + paddleHeight && ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballSpeedX = Math.abs(ballSpeedX);
		ballPosX   = player2Pos + paddleHeight + ballRadius;

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}




	if (ballPosY - ballRadius <= paddleWidth && (ballPosX >= player1Pos && ballPosX <= player1Pos + paddleHeight)){
		ballSpeedY = -ballSpeedY
	}

	if (
		ballPosX + ballRadius >= player1Pos &&
		ballPosX - ballRadius < player1Pos &&
		ballPosY - ballRadius <= paddleWidth &&
		ballPosY + ballRadius >= 0
	) {
		ballSpeedX = -Math.abs(ballSpeedX)
		ballPosX   = player1Pos - ballRadius

		ballSpeedX *= speedBoost
		ballSpeedY *= speedBoost
	}

	if (
		ballPosX - ballRadius <= player1Pos + paddleHeight &&
		ballPosX + ballRadius > player1Pos + paddleHeight &&
		ballPosY - ballRadius <= paddleWidth &&
		ballPosY + ballRadius >= 0
	) {
		ballSpeedX = Math.abs(ballSpeedX)
		ballPosX   = player1Pos + paddleHeight + ballRadius

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
		const maxX = initialPaddleSpeed * 0.9
		const minX = initialPaddleSpeed * 0.1
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
		ctx.value.fillStyle = settings.value.ball
		ctx.value.beginPath()
		ctx.value.arc(ballPosX, ballPosY, ballRadius, 0, Math.PI * 2)
		ctx.value.fill()
		ctx.value.closePath()
	}
}

const drawScores = () => {
	if (ctx.value) {
		ctx.value.save()
		ctx.value.font = '50px sans-serif'
		ctx.value.fillStyle = settings.value.score
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

const drawMessage = (color: string) => {
	if (ctx.value)
	{
		ctx.value.save()
		ctx.value.font = '40px sans-serif'
		ctx.value.fillStyle = color
		ctx.value.textAlign = 'center'

		ctx.value.fillText(
			message.value,
			canvasWidth.value / 2,
			canvasHeight.value / 2 - 20
		)
		ctx.value.restore()
	}
}

// const drawPlayerName = () => {
// 	if (ctx.value)
// 	{
// 		ctx.value.save()
// 		ctx.value.font = '40px sans-serif'
// 		ctx.value.fillStyle = 'white'
// 		// ctx.value.textAlign = 'center'
//
// 		ctx.value.fillText(
// 			player2Name.value,
// 			canvasWidth.value / 2,
// 			canvasHeight.value / 2 - 20
// 		)
// 		ctx.value.restore()
//
// 		ctx.value.save()
// 		ctx.value.font = '40px sans-serif'
// 		ctx.value.fillStyle = 'white'
// 		// ctx.value.textAlign = 'center'
//
// 		ctx.value.fillText(
// 			player1Name.value,
// 			canvasWidth.value / 2,
// 			canvasHeight.value / 2 - 20
// 		)
// 		ctx.value.restore()
// 	}
// }

const drawDivider = () => {
	if (ctx.value)
	{
		ctx.value.save();
		ctx.value.strokeStyle = settings.value.divider
		ctx.value.lineWidth = 2
		ctx.value.setLineDash([10, 10])
		ctx.value.beginPath()
		ctx.value.moveTo(0, canvasHeight.value / 2)
		ctx.value.lineTo(canvasWidth.value, canvasHeight.value / 2)
		ctx.value.stroke()
		ctx.value.restore()
	}
}

const drawBackground = () => {
	if (ctx.value) {
		ctx.value.fillStyle = settings.value.background
		ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
	}
}

const drawPaddles = () => {
	if (ctx.value) {
		ctx.value.fillStyle = settings.value.paddle
		// ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
		ctx.value.fillRect(player1Pos, 0, paddleHeight, paddleWidth)
		ctx.value.fillRect(player2Pos, canvasHeight.value - paddleWidth, paddleHeight, paddleWidth)
	}
}

const render = () => {
	drawBackground()
	drawPaddles()
	drawDivider()
	drawBall()
	drawScores()
	if (isWaiting && message.value) drawMessage('yellow')
}

let targetX = 0;

const startGame = (mode: string) => {
	gameMode.value = mode
	if (gameMode.value === "solo") {
		botInterval = setInterval(() => {
			targetX = predictBallX()
			const error = (Math.random() - 0.5) * 100
			targetX += error
		}, 1000)
	}
	resetBall(2) // For choose random ball vector at game start
	setTimeout(gameLoop, 1000)
}

const resetGame = () => {
	if (gameMode.value === 'solo') clearInterval(botInterval)
	player2Score.value = 0;
	player1Score.value = 0;
	player1Pos = (canvasWidth.value - paddleHeight) / 2
	player2Pos = (canvasWidth.value - paddleHeight) / 2
	ballPosX = canvasWidth.value / 2
	ballPosY = canvasHeight.value / 2
	ballSpeedX = basePaddleSpeed
	ballSpeedY = basePaddleSpeed
	isWaiting = false
	render()
}

const winGame = (player: string) => {
	message.value = player + ' win !'
	drawMessage('red')
	setTimeout(() => {
		resetGame()
		message.value = ''
		gameMode.value = null
	}, 2000)
}

const gameLoop = () => {
	if (gameMode.value === 'solo') pong_bot()
	updatePaddlesPosition()
	if (!isWaiting) updateBallPosition()
	if (player1Score.value == 11) { winGame(player1Name.value); return }
	if (player2Score.value == 11) { winGame(player2Name.value); return }
	render()
	// drawPlayerName()
	requestAnimationFrame(gameLoop)
}
</script>

<template>
	<div class="flex flex-col h-screen justify-center items-center">
<!--		<Header></Header>-->
		<div v-if="!gameMode" class="w-full h-full bg-[#000] absolute z-[1] opacity-60"></div>
		<div v-if="!gameMode" class="absolute z-10 space-y-6 flex flex-col w-2/3 md:flex-row md:justify-around md:items-center md:space-x-10">
			<h2 class="text-white font-bold text-5xl">| Pong .</h2>
			<div class="flex flex-col space-y-4 border p-4 rounded-xl md:flex-1">
				<button @click="startGame('solo')" class="text-black py-9 bg-[#fff] rounded-md text-lg">Solo (IA)</button>
				<button @click="startGame('multi')" class="text-black py-9 bg-[#fff] rounded-md text-lg">Multi (Local)</button>
				<button class="text-black py-9 bg-[#fff] rounded-md text-lg opacity-50 cursor-not-allowed" disabled>Tournament (Local)</button>
			</div>
			<button @click="showSettings = true" class="text-black py-3 md:px-4 bg-[#fff] rounded-md text-lg">Settings</button>
		</div>
		<div class=" bg-gray-800 w-[95%] h-[100vh]">
			<canvas ref="pongCanvas" class="w-full h-full"></canvas>
		</div>
		<Settings v-model:visible="showSettings" v-model:settings="settings"></Settings>
	</div>
<!--	<div class="flex flex-col min-h-screen items-center justify-center">-->
<!--		<Header></Header>-->

<!--		<div class="w-[95%] h-[100vh] relative flex  bg-gray-800 mx-auto rounded-xl py-3">-->
<!--			<canvas ref="pongCanvas" class="w-full h-full">-->

<!--			</canvas>-->
<!--		</div>-->
<!--	</div>-->
</template>
