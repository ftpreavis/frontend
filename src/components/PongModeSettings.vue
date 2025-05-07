<script lang="ts" setup>
import { ref } from 'vue'
const props = defineProps<{
	visible: boolean,
	mode: 'solo' | 'multi' | null,
	cheats: {enabled: boolean, ballSpeed: number, paddleSpeed: number},
	player1Name: string
}>()

interface playPayload {
	cheats: { enabled: boolean; ballSpeed: number; paddleSpeed: number }
	player1Name: string
}

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void,
	(event: 'play', payload: playPayload) : void
}>()

const localCheats = ref({ ...props.cheats })
const localPlayer1Name = ref(props.player1Name)


const play = () => {
	emit('play', {cheats: localCheats.value, player1Name: localPlayer1Name.value})
	emit('update:visible', false)
}
const close = () => { emit('update:visible', false) }

</script>

<template>
	<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]">
			<h3 class="text-center text-lg">{{ mode === 'solo' ? 'Solo' : 'Multi'}} settings</h3>
			<hr class="my-3">
			<div class="flex-1 overflow-y-auto mb-4 space-y-4">
				<div>
					<label class="inline-flex items-center">
						<input type="checkbox" v-model="localCheats.enabled" class="mr-2">
						Cheat {{ localCheats.enabled ? 'enabled' : 'disabled'}}
					</label>
					<div v-if="localCheats.enabled" class="space-y-">
						<label class="flex justify-between text-sm">
							Base ball speed
							<input type="range" v-model.number="localCheats.ballSpeed" min="1" max="15" step="0.1" class="mx-2 w-20">
						</label>
						<label class="flex justify-between text-sm">
							Base paddle speed
							<input type="range" v-model.number="localCheats.paddleSpeed" min="1" max="40" step="0.1" class="mx-2 w-20">
						</label>
					</div>
				</div>
				<div>
					<label>
						{{ mode === 'solo' ? 'IA ' : 'Player 1 '}} name :
						<input type="text" placeholder="BRR BRR" class="w-full border rounded px-2 py-1" v-model="localPlayer1Name">
					</label>
				</div>
			</div>

			<hr class="my-3">
			<div class="flex justify-between">
				<button @click="close">Return</button>
				<button class="text-blue-700" @click="play">Play</button>
			</div>
		</div>
	</div>
</template>
