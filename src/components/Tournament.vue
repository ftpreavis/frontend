<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTournament } from '@/store/tournament'
import { useAuth } from '@/store/auth';
import Settings from '@/components/PongSettings.vue'

const newPlayer = ref('')
const players = ref<string[]>([])
const tournament = useTournament()
const authStore = useAuth()
const localCheats = ref({ballSpeed: 7.5, paddleSpeed: 20})
const profileUser = ref<any | null>(null);
const showSettings = ref(false)

const props = defineProps<{
	visible: boolean,
    nextMatch: boolean,
    settings: {
		background: string,
		paddle: 	string,
		ball: 		string,
		divider:	string,
		score:		string
	}
}>()

const local = ref({ ...props.settings })
watch(() => props.visible, (isOpen) => {
	if (isOpen) {
		local.value = { ...props.settings }
	}
})

const getUsername = async() => {
    const data = await authStore.fetchUserById(<number>authStore.userId);
        if (data) {
            profileUser.value = data;
        }
}

    const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
    (event: 'update:nextMatch', value: boolean): void
    (event: 'playTournament', cheats: {ballSpeed: number, paddleSpeed: number}): void
    (event: 'update:settings', value: { background: string, paddle: string, ball: string , divider: string, score: string}): void
}>()

const close = () => {
    emit('update:visible', false)
    emit('update:nextMatch', true)
    emit('update:settings', { ...local.value })
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
    emit('playTournament', {ballSpeed:localCheats.value.ballSpeed, paddleSpeed:localCheats.value.paddleSpeed})
    close()
}

onMounted(async() => {
    await getUsername()
    players.value = tournament.matches
    .filter(match => match.round === 1)
    .flatMap(match => [match.player1, match.player2])
    .filter((player): player is string => player !== null);
    if (players.value.length == 0)
        players.value.push(profileUser.value.username)
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

    <button :disabled="players.length >= 32"
        @click="addPlayer"
        class="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
    >
        Ajouter
    </button>

    <p class="text-sm text-gray-600">
        {{ players.length }} joueur{{ players.length > 1 ? 's' : '' }} ajouté{{ players.length > 0 ? '.' : '' }}
    </p>

    <ul class="w-full divide-y divide-gray-200 bg-white rounded-lg shadow max-h-64 overflow-y-auto">
        <li
        v-for="(player, index) in players"
        :key="index"
        class="flex justify-between px-4 py-2"
        >
        <span>{{ player }}</span>
        <button v-if="index != 0" @click="removePlayer(index)" class="text-red-500 hover:underline">Supprimer</button>
        </li>
    </ul>

    <button
        :disabled="![4, 8, 16, 32].includes(players.length)"
        @click="startTournament"
        class="mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
        Créer le tournoi
    </button>
    <p v-if="players.length !== 0 && ![4, 8, 16, 32].includes(players.length)"
        class="text-sm text-red-500 mt-1"
        >
        Le nombre de joueurs doit être 4, 8, 16 ou 32 pour commencer le tournoi.
    </p>


    <div>
        <div class="space-y-2">
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
    <button @click="showSettings = true" class="text-black py-3 md:px-4 bg-[#fff] rounded-md text-lg">Settings</button>
    <Settings v-model:visible="showSettings" v-model:settings="local"></Settings>
</template>
