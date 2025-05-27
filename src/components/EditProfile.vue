<script lang="ts" setup>
import { BoldIcon } from "@heroicons/vue/24/outline";
import {computed, ref, watch} from "vue"
import TwoFactor from "@/components//TwoFactor.vue";
import { useAuth } from "@/store/auth";
import { useLang } from "@/composables/useLang"
import Modal from "@/components/Modal.vue";
import FormField from "@/components/Form/FormField.vue";

const { t } = useLang()

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
	<Modal v-model="modalVisible" title="Edit Profile">
		<div class="flex flex-col space-y-6">
			<FormField type="File" label="Avatar" accept="image/*" @change="handleAvatarChange"></FormField>
			<FormField v-model="username" label="Username" type="text" :placeholder="t('profile.usernamePlaceholder')"></FormField>
			<FormField v-model="bio" label="Bio" type="text" :placeholder="t('profile.bioPlaceholder')"></FormField>
			<FormField v-model="password" label="Password" type="text" :placeholder="t('profile.passwordPlaceholder')"></FormField>
			<button v-if="!authStore.user?.twoFAEnabled" class="cursor-pointer mt-4" @click="showTwoFactor = true"> {{ t('profile.enable2FA') }} </button>
		</div>
		<template #footer>
			<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
				<button type="button" class="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-600 sm:ml-3 sm:w-auto" @click="save">{{ t('profile.save') }}</button>
				<button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="close">{{ t('profile.close') }}</button>
			</div>
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
