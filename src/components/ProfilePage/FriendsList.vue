<script lang="ts" setup>
import {computed, onMounted, ref} from "vue";
import router from "@/router";
import { useLang } from "@/composables/useLang.ts"
import { useProfileManagement } from "@/store/profileManagement";

import Modal from "@/components/Modal/Modal.vue";

const { t } = useLang()
const profileStore = useProfileManagement()

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

const go = (path: string) => {
	close()
	router.push(path)
}

const close = () => emit('update:visible', false)
</script>

<template>
	<Modal v-model="modalVisible" :title="t('profile.friends')">
		<div class="flex flex-col space-y-3 max-h-[60vh] overflow-y-auto">
			<button class="flex flex-row items-center " v-for="friend in profileStore.friendUsers" @click="go('/profile/' + friend.id)" :key="friend.id">
				<div class="w-[40px] h-[40px] rounded-full bg-cover" :style="{ backgroundImage: `url(${friend.avatar})`}">
				</div>
				<span class="ml-2 dark:text-gray-100">{{friend.username}}</span>
			</button>
		</div>
	</Modal>
</template>
