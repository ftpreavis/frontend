<script lang="ts" setup>

import axios from 'axios';
import { nextTick, onMounted, ref, watch, computed } from 'vue'
import { useAuth } from '@/store/auth';
import Modal from "@/components/Modal/Modal.vue";

const authStore = useAuth()

const defaultSettings = {
	background: '#1F2937',
	paddle: 	'#FF0000',
	ball: 		'#FFFFFF',
	divider:	'#FFFFFF',
	score:		'#FFFFFF'
}

const props = defineProps<{
	visible: boolean,
	settings: {
		background: string,
		paddle: 	string,
		ball: 		string,
		divider:	string,
		score:		string
	}
}>()

const modalValue = computed({
	get: () => props.visible,
	set: (v: boolean) => {emit('update:visible', v)
    }
})

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
    (event: 'set'):void
}>()

// ... clone object
const local = ref({ ...props.settings })

const previewCanvas = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const colorFields = {
	background: { label: 'Background color' },
	paddle:		{ label: 'Paddle color'},
	ball:		{ label: 'Ball color' },
	divider:	{ label: 'Divider color' },
	score:		{ label: 'Score color' },
}

function drawPreview() {
	if (previewCanvas.value) {
		ctx.value = previewCanvas.value.getContext('2d')
		if (ctx.value)
		{
			const c = previewCanvas.value
			c.width = c.clientWidth
			c.height = c.clientHeight

			ctx.value.fillStyle = local.value.background
			ctx.value.fillRect(0, 0, c.width, c.height)

			ctx.value.fillStyle = local.value.paddle
			ctx.value.fillRect(10, (c.height / 2) - 10, 10, 40)
			ctx.value.fillRect(c.width - 20, (c.height / 2) - 10, 10, 40)

			ctx.value.fillStyle = local.value.ball
			ctx.value.beginPath()
			ctx.value.arc(c.width/2, c.height/2, 8, 0, Math.PI*2)
			ctx.value.fill()

			ctx.value.save();
			ctx.value.strokeStyle = local.value.divider
			ctx.value.lineWidth = 2
			ctx.value.setLineDash([10, 10])
			ctx.value.beginPath()
			ctx.value.moveTo(c.width / 2, 0)
			ctx.value.lineTo(c.width / 2, c.height)
			ctx.value.stroke()
			ctx.value.restore()

			ctx.value.save()
			ctx.value.font = '20px sans-serif'
			ctx.value.fillStyle = local.value.score
			ctx.value.textAlign = 'center'

			ctx.value.fillText(
            '0',
            40,
            c.height / 2
			)

			ctx.value.fillText(
            '0',
            c.width - 40,
            c.height / 2
			)
			ctx.value.restore()
		}
	}
}

watch(local, drawPreview, {deep: true})
watch(() => props.visible, (isOpen) => {
	if (isOpen) {
		local.value = { ...props.settings }
		nextTick(() => drawPreview())
	}
})

const setSettings = async() => {
    await axios.patch(`/api/users/${authStore.userId}/settings`,
        {
            background: local.value.background,
            paddle: local.value.paddle,
            ball: local.value.ball,
            divider: local.value.divider,
            score:local.value.score
        })
}

onMounted(() => {
	drawPreview()
})

const apply = () => {
    setSettings()
    emit('set')
	emit('update:visible', false)
}

const close = () => emit('update:visible', false)

</script>

<template>
    <Modal v-model="modalValue" title="Settings">
      <div class="flex flex-col items-center p-4 gap-4 max-w-md mx-auto dark:text-white">
        <h1 class="text-2xl font-bold">Customize Colors</h1>

        <p class="text-sm text-gray-500">Preview</p>
        <canvas ref="previewCanvas" class="w-full border rounded h-[100px] shadow-sm"></canvas>

        <div class="w-full">
          <button
            @click="local = defaultSettings"
            class="w-full py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm dark:text-black">
            reset default
          </button>
        </div>

        <div class="w-full space-y-4 max-h-60 overflow-y-auto">
          <div
            v-for="(field, key) in colorFields"
            :key="key"
            class="flex items-center justify-between">
            <label class="text-sm">{{ field.label }}</label>
            <input
              type="color"
              v-model="local[key]"
              class="border rounded h-10 w-12 shadow-sm">
          </div>
        </div>

        <div class="flex justify-between w-full pt-4 border-t mt-4">
          <button
            @click="close"
            class="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 dark:text-black">
            cancel
          </button>
          <button
            @click="apply"
            class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            apply
          </button>
        </div>
      </div>
    </Modal>
  </template>
