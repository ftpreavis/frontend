<script setup lang="ts">
import { onMounted } from 'vue'
import { useTournament } from '@/store/tournament'

const tournament = useTournament()

const props = defineProps<{
	visible: boolean,
    restart: boolean,
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
	(event: 'update:restart', value: boolean): void
}>()

const close = () => emit('update:visible', false)

function restartTournament() {
    emit('update:restart', true)
    close()
}

</script>

<template>
    <div v-if="visible" class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto">
        <div v-if="!tournament.tournamentFinished">
            <h1 class="text-2xl font-bold">Tournoi</h1>

            <!-- <ul class="w-full divide-y divide-gray-200 bg-white rounded-lg shadow max-h-64 overflow-y-auto">
            <li
                v-for="(player, index) in players"
                :key="index"
                class="flex justify-between px-4 py-2"
            >
                <span>{{ player }}</span>
            </li>
            </ul> -->
            <p>Gagnant du match precedent : {{ tournament.previousMatch.winner }}</p>
            <button
            @click="close"
            class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
            Démarrer le prochain match
            </button>
        </div>
        <div v-else>
            <h1 class="text-2xl font-bold">Gagnant : {{ tournament.tournamentWinner }}</h1>
            <button
            @click="restartTournament"
            class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
            Recommencer un tournoi
            </button>
        </div>
    </div>
</template>