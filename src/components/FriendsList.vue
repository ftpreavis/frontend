<script lang="ts" setup>
import {ref} from "vue";
import router from "@/router";

const props = defineProps<{
	visible: boolean
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
}>()

const friendsList = ref([
	{id: 1, userId: 2145, name: 'vabaud', profilePicture: 'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 3, userId: 17484, name: 'OnkelTag', profilePicture: 'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png'}
])

const go = (path: string) => {
	close()
	router.push(path)
}

const close = () => emit('update:visible', false)
</script>

<template>
	<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20" @click="close">
		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]" @click.stop>
			<div class="flex flex-row justify-between">
				<span class="text-lg">Friends list</span>
				<button @click="close">X</button>
			</div>
			<hr class="mt-1 mb-3">
			<div class="flex flex-col space-y-3">
				<button class="flex flex-row items-center " v-for="friend in friendsList" @click="go('/profile/' + friend.userId)" :key="friend.id">
					<div class="w-[40px] h-[40px] rounded-full bg-cover" :style="{ backgroundImage: `url(${friend.profilePicture})`}">
					</div>
					<span class="ml-2">{{friend.name}}</span>
				</button>
			</div>
		</div>
	</div>
</template>
