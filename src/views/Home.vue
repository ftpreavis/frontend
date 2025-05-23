<script lang="ts" setup>
import { useRouter } from "vue-router";
import { computed} from 'vue' // ref
import { useI18n } from 'vue-i18n'

import pongImage from '../assets/pongGameImage.jpg'
import PacManBanner from '../assets/PacManBanner.png'

import GameCard from '@/components/GameCard.vue'
import Header from '@/components/Header.vue'

const router = useRouter()
const { t } = useI18n()

function playPong() {
	router.push({name: 'Pong'})
}

function playPacman() {
	router.push({name: 'Pacman'})
}

function profile() {
	router.push({name: 'Profile'})
}

const games = computed(() => [
	{ id: 1, name: 'Pong', desc: t('pongGameDesc'), image: pongImage, tag: t('topTag'), playFunction: playPong},
	{ id: 2, name: 'PacMan', desc: t('pacManDesc'), image: PacManBanner, tag: t('newTag'), playFunction: playPacman},
])

</script>

<template>
	<div class="flex flex-col w-11/12 m-auto space-y-5 mt-5">
		<GameCard v-for="game in games" :key="game.id" :gameName="game.name" :imageUrl="game.image" :tag="game.tag" :desc="game.desc" @click="game.playFunction"></GameCard>
	</div>
	<h1 @click="profile">PROFILE</h1>
</template>

<style>
</style>
