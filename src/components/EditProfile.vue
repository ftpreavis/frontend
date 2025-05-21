<script lang="ts" setup>
import { BoldIcon } from "@heroicons/vue/24/outline";
import {c} from "vite/dist/node/moduleRunnerTransport.d-DJ_mE5sf";
import {ref, watch} from "vue"
import TwoFactor from "@/components//TwoFactor.vue";

const props = defineProps<{
	visible: boolean
    initialAvatar: string
    initialUsername: string
    initialBio: string
}>()

const emit = defineEmits<{
	(event: 'update:visible', value: boolean): void
    (event: 'save-profile', value: {avatar: File | null, username: string, bio: string, password: string}): void
}>()

const close = () => emit('update:visible', false)

const avatar = ref<File | null>(null)
const username = ref<string>('')
const bio = ref<string>('')
const password = ref<string>('')
const avatarPreview = ref<string>(props.initialAvatar);
const showTwoFactor = ref(false)

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            avatar.value = null;
            avatarPreview.value = props.initialAvatar;
            bio.value = props.initialBio;
            username.value = props.initialUsername;
        }
    }
);

const handleAvatarChange = (event: Event) =>{
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    avatar.value = target.files[0]
  }
}

const save = () => {
    emit('save-profile', {
    username: username.value,
    bio: bio.value,
    avatar: avatar.value,
    password: password.value,
    })
    close()
}
</script>

<template>
	<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20" @click="close">
		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]" @click.stop>
            <img v-if="avatarPreview" :src="avatarPreview" class="w-24 h-24 object-cover rounded-full mb-4" />
			<input type="File" accept="image/*" @change="handleAvatarChange">
			<input v-model="username" type="text" placeholder="Profile Name" class="border-[2px]">
			<input v-model="bio" type="text" placeholder="Biography" class="border-[2px]">
			<input v-model="password" type="password" placeholder="New password" class="border-[2px]">
			<button class="cursor-pointer" @click="save">save</button>
			<button class="cursor-pointer" @click="close">close</button>
            <button class="cursor-pointer mt-4" @click="showTwoFactor = true"> 2FA </button>
		</div>
	</div>
    <TwoFactor v-model:visible="showTwoFactor"/>
</template>
