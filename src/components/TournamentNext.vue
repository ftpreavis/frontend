<script setup lang="ts">
import { onMounted, computed } from 'vue'
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

const totalRounds = computed(() => {
  return Math.max(...tournament.matches.map(m => m.round));
});

function getRoundLabel(round: number, total: number): string {
  const diff = total - round;
  switch (diff) {
    case 4: return '16e de finale';
    case 3: return '8e de finale';
    case 2: return 'Quart de finale';
    case 1: return 'Demi-finale';
    case 0: return 'Finale';
    default: return `Round ${round}`;
  }
}

</script>

<template>
    <div v-if="visible" class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto">
        <div v-if="!tournament.tournamentFinished">
            <div class="max-h-[60vh] overflow-y-auto p-4 bg-white rounded-lg shadow-md w-full max-w-2xl mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">Tableau du tournoi</h2>

                <div
                v-for="round in totalRounds"
                :key="round"
                class="mb-6"
                >
                <h3 class="text-xl font-semibold mb-2">{{ getRoundLabel(round, totalRounds) }}</h3>

                <ul class="space-y-2">
                    <li
                    v-for="match in tournament.matches.filter(m => m.round === round)"
                    :key="match.id"
                    class="border border-gray-300 rounded-lg p-3 flex justify-between items-center bg-gray-50"
                    >
                    <div class="flex-1">
                        <p><strong>Joueur 1 :</strong> {{ match.player1 || 'À venir' }}</p>
                        <p><strong>Joueur 2 :</strong> {{ match.player2 || 'À venir' }}</p>
                    </div>

                    <div class="w-32 text-center">
                        <span v-if="match.winner">
                        <strong class="text-green-600">Gagnant :</strong><br />
                        {{ match.winner }}
                        </span>
                        <span v-else class="text-gray-500 italic">Pas encore joué</span>
                    </div>
                    </li>
                </ul>
                </div>
            </div>
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