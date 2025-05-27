<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTournament } from '@/store/tournament'

const newPlayer = ref('')
const players = ref<string[]>([])
const tournament = useTournament()
const localCheats = ref({ballSpeed: 7.5, paddleSpeed: 20})

const props = defineProps<{
	visible: boolean,
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
    (event: 'playTournament', cheats: {ballSpeed: number, paddleSpeed: number}): void
}>()

const close = () => {
    emit('update:visible', false)
    emit('playTournament', {ballSpeed:localCheats.value.ballSpeed, paddleSpeed:localCheats.value.paddleSpeed})
}

function addPlayer() {
    const name = newPlayer.value.trim()
    if (name && !players.value.includes(name)) {
    players.value.push(name)
    newPlayer.value = ''
    }
}

function removePlayer(index: number) {
    players.value.splice(index, 1)
}

function startTournament() {
    tournament.startTournament(players.value)
    close()
}
onMounted(() => {
    players.value = tournament.matches
    .filter(match => match.round === 1)
    .flatMap(match => [match.player1, match.player2])
    .filter((player): player is string => player !== null);

})

</script>

<template>
    <div v-if="visible" class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto">
        <h1 class="text-2xl font-bold">Créer un tournoi</h1>
    
        <div class="w-full">
        <label class="block text-sm font-medium text-gray-700">Nom du joueur</label>
        <input
            v-model="newPlayer"
            type="text"
            class="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ajouter un joueur"
        />
        </div>
    
        <button
        @click="addPlayer"
        class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
        Ajouter
        </button>
    
        <ul class="w-full divide-y divide-gray-200 bg-white rounded-lg shadow max-h-64 overflow-y-auto">
        <li
            v-for="(player, index) in players"
            :key="index"
            class="flex justify-between px-4 py-2"
        >
            <span>{{ player }}</span>
            <button @click="removePlayer(index)" class="text-red-500 hover:underline">Supprimer</button>
        </li>
        </ul>
    
        <button
        :disabled="players.length != 4 && players.length != 8 && players.length != 16 && players.length != 32"
        @click="startTournament"
        class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
        Démarrer le tournoi
        </button>
        <div>
					<div class="space-y-">
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
    </div>
</template>