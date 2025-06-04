<script lang="ts" setup>
import Header from '@/components/Header.vue'
import Settings from '@/components/PongSettings.vue'
import ModeSettings from '@/components/PongModeSettings.vue'
import Tournament from '@/components/Tournament.vue'
import TournamentNext from '@/components/TournamentNext.vue'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useTournament } from '@/store/tournament'
import { useAuth } from '@/store/auth'
import axios from 'axios'
import { forEachTrailingCommentRange } from 'typescript'

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
const scoreToWin = 3
let ballPosX = 0
let ballPosY = 0
let ballSpeed = 3
let basePaddleSpeed = 3
let initialPaddleSpeed = 0
let ballAngleX: number
let ballAngleY: number
const speedBoost = 1.05
const maxBounceAngle = Math.PI / 3
let isWaiting = false
const message = ref<string>('')
const gameMode = ref<'solo' | 'multi' | 'tournament' | null>(null)
let botInterval: ReturnType<typeof setInterval>

const player1Name = ref<string>('BRR BRR')
const player2Name = ref<string>('Azaleee')

let animationId: number | null = null

const showSettings = ref(false)
const settings = ref({
	background: '#1F2937',
	paddle: 	'#FF0000',
	ball: 		'#FFFFFF',
	divider:	'#FFFFFF',
	score:		'#FFFFFF'
})

const showTournament = ref(false)
const showNextMatch = ref(false)
const tournament = useTournament()
const authStore = useAuth()
const profileUser = ref<any | null>(null);

const showModeSettings = ref(false)
const modeSettingsMode = ref<'solo' | 'multi' | 'tournament' | null>(null)
const cheats =ref({ ballSpeed: ballSpeed, paddleSpeed: basePlayerSpeed })

watch(() => settings, async () => {
	await nextTick()
	render()
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

async function getSettings() {
  try {
    const response = await axios.get(`/api/users/${authStore.userId}/settings`)
    const data = response.data

    let hasChanged = false
    if (data.background !== 'default') {
      settings.value.background = data.background
      hasChanged = true
    }
    if (data.paddle !== 'default') {
      settings.value.paddle = data.paddle
      hasChanged = true
    }
    if (data.score !== 'default') {
      settings.value.score = data.score
      hasChanged = true
    }
    if (data.divider !== 'default') {
      settings.value.divider = data.divider
      hasChanged = true
    }
    if (data.ball !== 'default') {
      settings.value.ball = data.ball
      hasChanged = true
    }
    if (!hasChanged) {
      settings.value = { ...settings.value }
    }
  } catch (error) {
    console.error("Error with get Settings :", error)
  }
}

onMounted(() => {
    getSettings()
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
    getUsername()
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
	if (event.key === 'q' || event.key === 'Q') leftKey1 = true
	if (event.key === 'w' || event.key === 'W') rightKey1 = true
	if (event.key === 'ArrowLeft') leftKey2 = true
	if (event.key === 'ArrowRight') rightKey2 = true
}

const handleKeyUp = (event: KeyboardEvent) => {
	if (event.key === 'q' || event.key === 'Q') leftKey1 = false
	if (event.key === 'w' || event.key === 'W') rightKey1 = false
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
	const timeToReach = (ballPosY - paddleWidth) / Math.abs(ballAngleY)
	let predictedX = ballPosX + ballAngleX * timeToReach

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
	if (isWaiting) return

	ballPosX += ballAngleX
	ballPosY += ballAngleY
	if (ballPosY - ballRadius <= 0) {
		player2Score.value++
		message.value = player2Name.value + ' scored !'
		resetBall(1)
		return
	} else if (ballPosY + ballRadius >= canvasHeight.value) {
		player1Score.value++
		message.value = player1Name.value + ' scored !'
		resetBall(2)
		return
	}

	if (ballPosX - ballRadius <= 0 || ballPosX + ballRadius >= canvasWidth.value) {
		ballAngleX = -ballAngleX
	}

    if (ballPosY + ballRadius >= canvasHeight.value - paddleWidth && ballPosX >= player2Pos && ballPosX <= player2Pos + paddleHeight) {
        const relativeIntersectX = (ballPosX - (player2Pos + paddleHeight / 2)) / (paddleHeight / 2)

        const bounceAngle = relativeIntersectX * maxBounceAngle

        const speed = Math.sqrt(ballAngleX ** 2 + ballAngleY ** 2) * speedBoost

        ballAngleX = speed * Math.sin(bounceAngle)
        ballAngleY = -speed * Math.cos(bounceAngle)

        ballPosY = canvasHeight.value - paddleWidth - ballRadius
    }

	if (
		ballPosX + ballRadius >= player2Pos &&
		ballPosX - ballRadius < player2Pos &&
		ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballAngleX = -Math.abs(ballAngleX);
		ballPosX   = player2Pos - ballRadius;

		ballAngleX *= speedBoost
		ballAngleY *= speedBoost
	}

	if (
		ballPosX - ballRadius <= player2Pos + paddleHeight &&
		ballPosX + ballRadius > player2Pos + paddleHeight && ballPosY >= canvasHeight.value - paddleWidth && ballPosY <= canvasHeight.value
	) {
		ballAngleX = Math.abs(ballAngleX);
		ballPosX   = player2Pos + paddleHeight + ballRadius;

		ballAngleX *= speedBoost
		ballAngleY *= speedBoost
	}

    if (ballPosY - ballRadius <= paddleWidth && (ballPosX >= player1Pos && ballPosX <= player1Pos + paddleHeight)) {
        const relativeIntersectX = (ballPosX - (player1Pos + paddleHeight / 2)) / (paddleHeight / 2)

        const bounceAngle = relativeIntersectX * maxBounceAngle

        const speed = Math.sqrt(ballAngleX ** 2 + ballAngleY ** 2) * speedBoost

        ballAngleX = speed * Math.sin(bounceAngle)
        ballAngleY = speed * Math.cos(bounceAngle)

        ballPosY = paddleWidth + ballRadius
    }

	if (
		ballPosX + ballRadius >= player1Pos &&
		ballPosX - ballRadius < player1Pos &&
		ballPosY - ballRadius <= paddleWidth &&
		ballPosY + ballRadius >= 0
	) {
		ballAngleX = -Math.abs(ballAngleX)
		ballPosX   = player1Pos - ballRadius
		ballAngleX *= speedBoost
		ballAngleY *= speedBoost
	}

	if (
		ballPosX - ballRadius <= player1Pos + paddleHeight &&
		ballPosX + ballRadius > player1Pos + paddleHeight &&
		ballPosY - ballRadius <= paddleWidth &&
		ballPosY + ballRadius >= 0
	) {
		ballAngleX = Math.abs(ballAngleX)
		ballPosX   = player1Pos + paddleHeight + ballRadius

		ballAngleX *= speedBoost
		ballAngleY *= speedBoost
	}
}

const resetBall = (server: 1 | 2) => {
	ballAngleX = 0
	ballAngleY = 0
	ballPosX = (canvasWidth.value  - ballRadius * 2) / 2 + ballRadius
	ballPosY = (canvasHeight.value - ballRadius * 2) / 2 + ballRadius
	isWaiting = true
	setTimeout(() => {
        const angleDeg = (((Math.random() * 60) * Math.PI) / 180)
		const directionX = Math.random() < 0.5 ? 1 : -1
		const directionY = server === 2 ? -1 : 1
		ballAngleX = Math.sin(angleDeg) * ballSpeed * directionX
        ballAngleY = Math.cos(angleDeg) * ballSpeed * directionY
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
	if (isWaiting && message.value && (player1Score.value != scoreToWin && player2Score.value != scoreToWin)) drawMessage('yellow')
}

let targetX = 0;

const playGame = (payload: { cheats: { ballSpeed: number; paddleSpeed: number }, player1Name: string }) => {
    getSettings()
	cheats.value = payload.cheats
	player1Name.value = payload.player1Name
	// if (cheats.value.enabled) {
		ballSpeed = cheats.value.ballSpeed
		playerSpeed = cheats.value.paddleSpeed
	// } else {
		// ballSpeed = canvasHeight.value * 0.005
		// playerSpeed = 10
	// }
	if (modeSettingsMode.value) startGame(modeSettingsMode.value)
}

const playTournamentGame = (cheats: {ballSpeed: number; paddleSpeed: number }) => {
    ballSpeed = cheats.ballSpeed
    playerSpeed = cheats.paddleSpeed
    updatePlayerName()
	if (modeSettingsMode.value) startGame(modeSettingsMode.value)
}

const getUsername = async() => {
    const data = await authStore.fetchUserById(<number>authStore.userId);
        if (data) {
            profileUser.value = data;
        }
}

const updatePlayerName = () => {
    player1Name.value = <string>tournament.currentMatch.player2
    player2Name.value = <string>tournament.currentMatch.player1
}

const pushMatch = async() => {
    if (gameMode.value == 'tournament' && tournament.currentMatch.player1 == profileUser.value.username) {
        await axios.post('/api/matches', {player1Id: authStore.userId, player2Name: player1Name.value, player1Score: player2Score.value, player2Score: player1Score.value})
    }
    else if (gameMode.value != 'tournament'){
        await axios.post('/api/matches', {player1Id: authStore.userId, player2Name: player1Name.value, player1Score: player2Score.value, player2Score: player1Score.value})
    }
}

const startGame = (mode: 'solo' | 'multi' | 'tournament' | null) => {
	if (animationId !== null) {
		cancelAnimationFrame(animationId)
		animationId = null
	}
	if (botInterval) clearInterval(botInterval)
	resetGame()
    gameMode.value = mode
    if (gameMode.value === "solo") {
        botInterval = setInterval(() => {
        targetX = predictBallX()
        const error = (Math.random() - 0.5) * 100
        targetX += error
    }, 1000)
    }
    if (gameMode.value == 'tournament' && !showTournament) {
        player1Name.value = tournament.currentMatch.player1 || 'null'
        player2Name.value = tournament.currentMatch.player2 || 'null'
    }
    else if (gameMode.value != 'tournament'){
        player2Name.value = profileUser.value.username
    }
	resetBall(2) // For choose random ball vector at game start
	gameLoop()
}

const resetGame = () => {
	if (gameMode.value === 'solo') clearInterval(botInterval)
	player2Score.value = 0;
	player1Score.value = 0;
	player1Pos = (canvasWidth.value - paddleHeight) / 2
	player2Pos = (canvasWidth.value - paddleHeight) / 2
	ballPosX = canvasWidth.value / 2
	ballPosY = canvasHeight.value / 2
	ballAngleX = basePaddleSpeed
	ballAngleY = basePaddleSpeed
	isWaiting = false
	render()
}

const winGame = async(player: string) => {
	message.value = player + ' win !'
	drawMessage('red')
    if (gameMode.value == 'tournament') {
        showNextMatch.value = true
        pushMatch()
        resetGame()
        tournament.matchFinished(tournament.currentMatchIndex, player)
        updatePlayerName()
        return
    }
	setTimeout(async() => {
        pushMatch()
        resetGame()
        message.value = ''
        gameMode.value = null
	}, 2000)
}

const gameLoop = () => {
    if (!showTournament.value && !showNextMatch.value && gameMode.value){
        if (gameMode.value === 'solo') pong_bot()
        updatePaddlesPosition()
        updateBallPosition()
        render()
        if (player1Score.value == scoreToWin) { winGame(player1Name.value)}
        if (player2Score.value == scoreToWin) { winGame(player2Name.value)}
        if (gameMode.value != 'tournament' && (player1Score.value == 3 || player2Score.value == 3)) {return}
        // drawPlayerName()
    }
    animationId = requestAnimationFrame(gameLoop)
}
</script>

<template>
	<div class="flex flex-col w-full h-full justify-center items-center relative overflow-hidden">
		<div v-if="!gameMode" class="w-full h-full bg-[#000] absolute z-[1] opacity-60"></div>
		<div v-if="!gameMode" class="absolute z-10 space-y-6 flex flex-col w-2/3 md:flex-row md:justify-around md:items-center md:space-x-10">
			<h2 class="text-white font-bold text-5xl">| Pong .</h2>
			<div class="flex flex-col space-y-4 border p-4 rounded-xl md:flex-1">
				<button @click="modeSettingsMode = 'solo'; showModeSettings = true" class="text-black py-9 bg-[#fff] rounded-md text-lg">Solo (IA)</button>
				<button @click="showModeSettings = true; modeSettingsMode = 'multi'" class="text-black py-9 bg-[#fff] rounded-md text-lg">Multi (Local)</button>
				<button @click="showTournament = true; modeSettingsMode = 'tournament'; gameMode = 'tournament'" class="text-black py-9 bg-[#fff] rounded-md text-lg">Tournament (Local)</button>
			</div>
			<button @click="showSettings = true" class="text-black py-3 md:px-4 bg-[#fff] rounded-md text-lg">Settings</button>
		</div>
		<Tournament v-if="showTournament" v-model:visible="showTournament" v-model:nextMatch="showNextMatch" v-model:gameMode="gameMode" @playTournament="playTournamentGame"></Tournament>
		<TournamentNext v-if="showNextMatch" v-model:visible="showNextMatch" v-model:gameMode="gameMode" v-model:restart="showTournament"></TournamentNext>
		<div class=" bg-gray-800 w-[95%] h-full">
			<canvas ref="pongCanvas" class="w-full h-full"></canvas>
		</div>
		<Settings v-model:visible="showSettings" v-model:settings="settings" @set="getSettings"></Settings>
		<ModeSettings v-model:visible="showModeSettings" :cheats="cheats" :mode="modeSettingsMode" :player1-name="player1Name" @play="playGame"></ModeSettings>
	</div>
</template>
