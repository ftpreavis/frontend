<script lang="ts" setup>

import { nextTick, onMounted, ref, watch } from 'vue'

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

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
	(event: 'update:settings', value: { background: string, paddle: string, ball: string , divider: string, score: string}): void
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
onMounted(() => {
	drawPreview()
})

const apply = () => {
	emit('update:settings', { ...local.value })
	emit('update:visible', false)
}

const close = () => emit('update:visible', false)

</script>

<template>
	<div v-if="props.visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]">
			<h3 class="text-center text-lg">Settings</h3>
			<p class="text-sm text-gray-500">Preview</p>
			<div class="mb-4">
				<canvas ref="previewCanvas" class="w-full border h-[100px]"></canvas>
			</div>

			<div class="flex-1 overflow-y-auto mb-4 space-y-4">
				<div v-for="(field, key) in colorFields" :key="key" class="">
					<p class="text-sm mb-2">{{ field.label }}</p>
					<input type="color" v-model="local[key]" class="border-2 rounded h-10 w-12">
				</div>
			</div>
			<hr class="my-3">
			<div class="flex justify-between">
				<button @click="close">Cancel</button>
				<button class="text-blue-700" @click="apply">Apply</button>
			</div>
		</div>
	</div>
</template>
