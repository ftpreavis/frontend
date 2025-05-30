<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTournament } from '@/store/tournament'
import { useLang } from '@/composables/useLang';

const tournament = useTournament()
const t = useLang()
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
    case 4: return 'tournament.round.32';
    case 3: return 'tournament.round.16';
    case 2: return 'tournament.round.8';
    case 1: return 'tournament.round.4';
    case 0: return 'tournament.round.2';
    default: return `Round ${round}`;
  }
}

</script>

<template>
    <div v-if="visible" class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto">
        <div v-if="!tournament.tournamentFinished">
            <div class="max-h-[60vh] overflow-y-auto p-4 bg-white rounded-lg shadow-md w-full max-w-2xl mx-auto">
                <h2 class="text-2xl font-bold mb-4 text-center">{{$t('tournament.table')}}</h2>
                <div
                v-for="round in totalRounds"
                :key="round"
                class="mb-6">
                <h3 class="text-xl font-semibold mb-2">{{ $t(getRoundLabel(round, totalRounds)) }}</h3>

                <ul class="space-y-2">
                    <li
                    v-for="match in tournament.matches.filter(m => m.round === round)"
                    :key="match.id"
                    class="border border-gray-300 rounded-lg p-3 flex justify-between items-center bg-gray-50"
                    >
                    <div class="flex-1">
                        <p class="font-bold">{{$t('tournament.player')}} 1 : {{ match.player1 || $t('tournament.future') }}</p>
                        <p class="font-bold">{{$t('tournament.player')}} 2 : {{ match.player2 || $t('tournament.future') }}</p>
                    </div>

                    <div class="w-32 text-center">
                        <span v-if="match.winner">
                        <p class="font-bold text-green-600">{{ $t('tournament.winner') }}" :</p><br />
                        {{ match.winner }}
                        </span>
                        <span v-else class="text-gray-500 italic">{{ $t('tournament.notPlayed') }}</span>
                    </div>
                    </li>
                </ul>
                </div>
            </div>
            <button
            @click="close"
            class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
            >
            {{$t('tournament.nextMatch')}}
            </button>
        </div>
        <div v-else>
            <h1 class="text-2xl font-bold">{{ $t('tournament.winner') }} : {{ tournament.tournamentWinner }}</h1>
            <button
            @click="restartTournament"
            class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400">
            {{ $t('tournament.restart') }}
            </button>
        </div>
    </div>
</template>