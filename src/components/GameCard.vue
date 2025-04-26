<script setup lang="ts">
import { defineProps } from 'vue'
import {
	PlayCircleIcon
} from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({
	gameName: {
		type: String,
		required: true
	},
	imageUrl: {
		type: String,
		required: true
	},
	desc: {
		type: String,
		required: true
	},
	tag: {
		type: String,
		required: false
	}
})
</script>

<template>
	<div class="relative bg-white rounded-2xl shadow-lg overflow-hidden w-full">
		<div v-if="tag" :class="{'bg-blue-500': tag == t('newTag'), 'bg-yellow-500': tag == t('topTag')}" class="absolute top-2 left-2 text-white text-xs font-bold py-1 px-2 rounded-full">
			{{ tag }}
		</div>
		<img :src="imageUrl" :alt="gameName" class="w-full object-cover h-[150px]">
		<div class="p-3 flex justify-between w-11/12 m-auto">
			<div>
				<h3 class="text-2xl font-semibold">{{ gameName }}</h3>
				<p class="text-stone-500">{{ desc }}</p>
			</div>
			<PlayCircleIcon class="w-11"></PlayCircleIcon>
		</div>
	</div>
</template>
