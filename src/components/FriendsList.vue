<script lang="ts" setup>
import {computed, ref} from "vue";
import router from "@/router";
import { useLang } from "@/composables/useLang"
import Modal from "@/components/Modal.vue";

const { t } = useLang()

const props = defineProps<{
	visible: boolean
}>()

const modalVisible = computed({
	get: () => props.visible,
	set: (val: boolean) => emit('update:visible', val)
})

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
}>()

const friendsList = ref([
	{id: 1, userId: 2145, name: 'vabaud', profilePicture: 'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 3, userId: 17484, name: 'OnkelTag', profilePicture: 'https://d3nn82uaxijpm6.cloudfront.net/assets/avatar/athlete/large-800a7033cc92b2a5548399e26b1ef42414dd1a9cb13b99454222d38d58fd28ef.png'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'},
	{id: 2, userId: 4564, name: 'Kiwi Cométaire', profilePicture: 'https://dgalywyr863hv.cloudfront.net/pictures/athletes/161839970/36281934/1/large.jpg'}
])

const go = (path: string) => {
	close()
	router.push(path)
}

const close = () => emit('update:visible', false)
</script>

<template>
	<Modal v-model="modalVisible" :title="t('profile.friends')">
		<div class="flex flex-col space-y-3 max-h-[60vh] overflow-y-auto">
			<button class="flex flex-row items-center " v-for="friend in friendsList" @click="go('/profile/' + friend.userId)" :key="friend.id">
				<div class="w-[40px] h-[40px] rounded-full bg-cover" :style="{ backgroundImage: `url(${friend.profilePicture})`}">
				</div>
				<span class="ml-2 dark:text-gray-100">{{friend.name}}</span>
			</button>
		</div>
	</Modal>
</template>
