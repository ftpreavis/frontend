<script lang="ts" setup>
import {ref, watch} from "vue"
import { useAuth } from "../store/auth.ts";
import axios from "axios"
import { useLang } from '@/composables/useLang.ts'

const authStore = useAuth()
const { t } = useLang()
const qrCodeUrl = ref<string>('')
const code = ref<string>('')

const props = defineProps<{
    visible: boolean
}>()

const emit = defineEmits<{
    (event: 'update:visible', value: boolean): void
}>()

const close = () => emit('update:visible', false)

watch(() => props.visible, async (newVal) => {
    if (newVal) {
        try {
            const response = await axios.post('/api/auth/2fa/setup', {}, {
                headers: {
                Authorization: `Bearer ${authStore.token}`
                }
            })
            qrCodeUrl.value = response.data.qrCodeUrl
        } catch (err: any) {
            console.error(err)
        }
    }
})

const TwoFactorVerif = async() => {
    try {
        await axios.post('/api/auth/2fa/verify', {token: code.value}, {
            headers: {
            Authorization: `Bearer ${authStore.token}`
            }
        })
        close()
    } catch (err: any) {
        console.error(err)
    }
}
</script>

<template>
    <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30" @click="close">
        <div class="bg-white rounded-lg p-6 w-[300px] flex flex-col items-center" @click.stop>
        <h2 class="text-lg font-semibold mb-4">{{ t('twoFactor.title') }}</h2>

        <div v-if="qrCodeUrl">
            <img :src="qrCodeUrl" alt="QR Code 2FA" class="w-40 h-40 mb-4 border rounded-md" />
            <p class="text-sm text-gray-600 mb-2 text-center">{{ t('twoFactor.scanPrompt') }}</p>
            <input
            v-model="code"
            type="text"
            :placeholder="t('twoFactor.inputPlaceholder')"
            class="border p-2 w-full rounded mb-2 text-center"
            />
            <button
            @click="TwoFactorVerif"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
            >
            {{ t('twoFactor.submit') }}
            </button>
        </div>
        <button class="text-gray-500 mt-4 text-sm underline" @click="close">{{ t('twoFactor.close') }}</button>
        </div>
    </div>
</template>
