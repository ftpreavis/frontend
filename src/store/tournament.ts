import { defineStore } from 'pinia';
import {ref} from "vue"

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

    const startTournament = (player: string[]) => {
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

    return {
        players,
        matches,
        tournamentFinished,

        startTournament,
        setMatches
    }
})