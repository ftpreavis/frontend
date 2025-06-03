<script lang="ts" setup>
import { ref, computed } from 'vue'
import Modal from "@/components/Modal/Modal.vue";
import { onMounted } from 'vue';

const props = defineProps<{
	visible: boolean,
	mode: 'solo' | 'multi' | 'tournament' | null,
	cheats: {ballSpeed: number, paddleSpeed: number},
	player1Name: string
}>()

const modalValue = computed({
	get: () => props.visible,
	set: (v: boolean) => {emit('update:visible', v)
    }
})

interface playPayload {
	cheats: { ballSpeed: number; paddleSpeed: number }
	player1Name: string
}

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void,
	(event: 'play', payload: playPayload) : void
}>()

const localCheats = ref({ ballSpeed: 5, paddleSpeed: 15 })
const localPlayer1Name = ref( props.mode === 'solo' ? 'IA' : 'player1' )


const play = () => {
	emit('play', {cheats: localCheats.value, player1Name: localPlayer1Name.value})
	emit('update:visible', false)
}
const close = () => { emit('update:visible', false) }

</script>

<template>
    <Modal v-model="modalValue" :title="mode === 'solo' ? 'Solo Settings' : 'Multiplayer Settings'">
        <div class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto">

            <div class="w-full space-y-2 dark:text-white">
            <label class="flex justify-between text-sm items-center">
                Base ball speed
                <input
                type="range"
                v-model.number="localCheats.ballSpeed"
                min="1"
                max="15"
                step="0.1"
                class="ml-2 w-32"
                />
            </label>
            <label class="flex justify-between text-sm items-center">
                Base paddle speed
                <input
                type="range"
                v-model.number="localCheats.paddleSpeed"
                min="1"
                max="40"
                step="0.1"
                class="ml-2 w-32"
                />
            </label>
            </div>

            <div class="w-full">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-400">
                {{ mode === 'solo' ? 'IA Name' : 'Player 1 Name' }}
            </label>
            <input
                type="text"
                placeholder="player1"
                class="mt-1 w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                v-model="localPlayer1Name"
            >
            </div>

            <div class="flex justify-between w-full pt-4 border-t mt-4">
            <button
                @click="close"
                class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400">
                Return
            </button>
            <button
                @click="play"
                class="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                Play
            </button>
            </div>
        </div>
    </Modal>
</template>


