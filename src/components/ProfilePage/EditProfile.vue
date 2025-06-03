<script lang="ts" setup>
import { BoldIcon } from "@heroicons/vue/24/outline";
import {computed, ref, watch, onMounted} from "vue"
import TwoFactor from "@/components/Modal/AuthModal/TwoFactor.vue";
import { useAuth } from "@/store/auth.ts";
import { useLang } from "@/composables/useLang.ts"

import Modal from "@/components/Modal/Modal.vue";
import FormField from "@/components/Form/FormField.vue";
import AppButton from "@/components/Utils/AppButton.vue";

const { t } = useLang()
const profileUser = ref<any | null>(null);

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

const modalVisible = computed({
	get: () => props.visible,
	set: (val: boolean) => emit('update:visible', val)
})

const close = () => emit('update:visible', false)

const avatar = ref<File | null>(null)
const username = ref<string>('')
const bio = ref<string>('')
const password = ref<string>('')
const avatarPreview = ref<string>(props.initialAvatar);
const showTwoFactor = ref(false)
const authStore = useAuth()
const twoFAEnabled = ref(false)

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

const getUsername = async() => {
    const data = await authStore.fetchUserById(<number>authStore.userId);
        if (data) {
            profileUser.value = data;
        }
    }

onMounted(async() => {
    await getUsername()
    twoFAEnabled.value = profileUser.value?.twoFAEnabled
})


</script>

<template>
	<Modal v-model="modalVisible" title="Edit Profile">
		<div class="flex flex-col space-y-6">
			<FormField type="File" label="Avatar" @change="handleAvatarChange"></FormField>
			<FormField v-model="username" label="Username" type="text" :placeholder="t('profile.usernamePlaceholder')"></FormField>
			<FormField v-model="bio" label="Bio" type="text" :placeholder="t('profile.bioPlaceholder')"></FormField>
			<FormField v-model="password" label="Password" type="text" :placeholder="t('profile.passwordPlaceholder')"></FormField>
			<button v-if="twoFAEnabled == false" class="cursor-pointer mt-4 dark:text-white" @click="showTwoFactor = true"> {{ t('profile.enable2FA') }} </button>
		</div>
		<template #footer>
			<AppButton @click="close" type="button" variant="secondary" :label="t('profile.close')"></AppButton>
			<AppButton @click="save" type="button" variant="primary" :label="t('profile.save')"></AppButton>
		</template>
	</Modal>
<!--	<div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20" @click="close">-->
<!--		<div class="bg-white rounded-lg shadow-lg p-6 h-[70vh] flex flex-col w-[300px]" @click.stop>-->
<!--            <img v-if="avatarPreview" :src="avatarPreview" class="w-24 h-24 object-cover rounded-full mb-4" />-->
<!--			<input type="File" accept="image/*" @change="handleAvatarChange">-->
<!--			<input v-model="username" type="text" :placeholder="t('profile.usernamePlaceholder')" class="border-[2px]">-->
<!--			<input v-model="bio" type="text" :placeholder="t('profile.bioPlaceholder')" class="border-[2px]">-->
<!--			<input v-model="password" type="password" :placeholder="t('profile.passwordPlaceholder')" class="border-[2px]">-->
<!--			<button class="cursor-pointer" @click="save">{{ t('profile.save') }}</button>-->
<!--			<button class="cursor-pointer" @click="close">{{ t('profile.close') }}</button>-->
<!--            <button v-if="!authStore.user?.twoFAEnabled" class="cursor-pointer mt-4" @click="showTwoFactor = true"> {{ t('profile.enable2FA') }} </button>-->
<!--		</div>-->
<!--	</div>-->
    <TwoFactor v-model:visible="showTwoFactor"/>
</template>
