<script lang="ts" setup>
import BigButton from '@/components/BigButton.vue'
import Header from '@/components/Header.vue'
</script>

<template>
	<Header class="z-10"></Header>
	<div class="relative bg-[#436B9D] h-screen flex flex-col items-center justify-center space-y-7">
		<h1 class="font-[Kanit] text-white text-center text-4xl">CHOOSE GAME MODE</h1>
		<div class="flex flex-col w-[300px] space-y-4">
			<BigButton>SOLO</BigButton>
			<BigButton>DUO</BigButton>
			<BigButton>SQUAD</BigButton>
		</div>
	</div>
</template>
