import { defineStore } from 'pinia';
import {ref, computed} from "vue"

export type Match = {
    id: number,
    round: number,
    player1: string | null,
    player2: string | null,
    winner: string | null
}

export const useTournament = defineStore('tournament', () => {
    const players = ref<string[]>([])
    const matches = ref<Match[]>([])
    const tournamentFinished = ref(false)
    const currentMatchIndex = ref(0)
    const tournamentWinner = ref('')

    const currentMatch = computed(() => matches.value[currentMatchIndex.value])
    const previousMatch = computed(() => matches.value[currentMatchIndex.value - 1])

    const startTournament = (player: string[]) => {
        tournamentWinner.value = ''
        tournamentFinished.value = false
        currentMatchIndex.value = 0;
        players.value = player
        matches.value = setMatches(player)
    }

    const setMatches = (players: string[]): Match[] => {
        const matches: Match[] = []
        let matchId = 1
        let round = 1
        let currentPlayers: (string | null)[] = players
        while (currentPlayers.length > 1) {
            const nextPlayers: (string | null)[] = []
            for (let i = 0; currentPlayers.length > i; i++) {
                matches.push({
                    id: matchId++,
                    round: round,
                    player1: currentPlayers[i++],
                    player2: currentPlayers[i],
                    winner: null
                })
                nextPlayers.push(null)
            }
            round++
            currentPlayers = nextPlayers
        }
        return matches
    }

    function matchFinished(matchIndex: number, winner: string) {
        matches.value[matchIndex].winner = winner
        assignWinnerToNextMatch(matches.value, matchIndex)
        currentMatchIndex.value++
        if (matches.value.length == currentMatchIndex.value) {tournamentFinished.value = true; tournamentWinner.value = winner}
    }
    
    function assignWinnerToNextMatch(matches: Match[], currentMatchIndex: number) {
        const currentMatch = matches[currentMatchIndex]
        const winner = currentMatch.winner
        const currentRound = currentMatch.round
    
        if (!winner) return
    
        // Trouver les matchs du prochain round
        const nextRoundMatches = matches.filter(m => m.round === currentRound + 1)
        if (!nextRoundMatches.length) return
    
        const nextMatchIndex = Math.floor(currentMatchIndex / 2)
        const nextMatch = nextRoundMatches[nextMatchIndex]
    
        if (!nextMatch) return
    
        if (currentMatchIndex % 2 === 0) {
            nextMatch.player1 = winner
        } else {
            nextMatch.player2 = winner
        }
    }

    return {
        players,
        matches,
        tournamentFinished,
        currentMatchIndex,
        tournamentWinner,
        currentMatch,
        previousMatch,

        startTournament,
        setMatches,
        matchFinished
    }
})