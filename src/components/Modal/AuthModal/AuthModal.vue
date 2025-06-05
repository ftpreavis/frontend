<script lang="ts" setup>

import {computed, ref, watch} from "vue";
import {useLang} from "@/composables/useLang.ts";
import {useAuth} from "@/store/auth.ts";

import Modal from "@/components/Modal/Modal.vue";
import FormField from "@/components/Form/FormField.vue";
import FullForm from "@/components/Form/FullForm.vue";
import OAuthButton from "@/components/Form/OAuthButton.vue";
import ConfirmDialogModal from "@/components/Modal/ConfirmDialogModal.vue";
import AppButton from "@/components/Utils/AppButton.vue";
import ErrorMessage from "@/components/Utils/ErrorMessage.vue";

const props = defineProps<{
	modelValue: boolean
}>()

const emit = defineEmits<{
	(event: 'update:modelValue', value: boolean): void
}>()

const isVisible = computed({
	get: () => props.modelValue,
	set: (value: boolean) => emit('update:modelValue', value)
})

const { t } = useLang()
const authStore = useAuth()
const mode = ref<'signup' | 'login'>('login')
const requires2FA = ref<boolean>(false)
const username = ref("")
const email = ref("")
const password = ref("")
const token2FA = ref("")
const errors = ref<{
	username?: string,
	email?: string,
	password?: string,
	token2FA?: string
}>({})
const viewConfirm = ref<boolean>(false)

function toggleMode() {
	errors.value = {}
	mode.value = mode.value === 'signup' ? 'login' : 'signup'
}

async function onLogin() {
	if (authStore.loginError)
		authStore.loginError = ''
	errors.value = {}

	if (!username.value) {
		errors.value.username = 'error.login.usernameRequired'
	}
	if (!password.value) {
		errors.value.password = 'error.login.passwordRequired'
	}
	if (username.value && password.value) {
		if (await authStore.authenticate(username.value, password.value)) {
			requires2FA.value = true
		}
	}
}

async function log2FA() {
	if (!token2FA.value) {
		errors.value.token2FA = 'error.login.tokenRequired'
	}
	else
		await authStore.authenticate2FA(username.value, token2FA.value)
}

async function onSignup() {
	errors.value = {}

	if (!username.value){
		errors.value.username = 'error.signup.usernameRequired'
	}

	if (!password.value){
		errors.value.password = 'error.signup.passwordRequired'
	}

	if (!email.value){
		errors.value.email = 'error.signup.emailRequired'
	}

	if (email.value && password.value && username.value){
		await authStore.signup(username.value, email.value, password.value)
	}
}

function onConfirmClose() {
	viewConfirm.value = false
	isVisible.value = false
	mode.value = 'login'
	requires2FA.value = false
	username.value = ''
	email.value = ''
	password.value = ''
	token2FA.value = ''
	errors.value = {}
}

function onCancelClose() {
	viewConfirm.value = false
}


function requestClose(value: boolean) {

	if (value === false && mode.value === 'login' && requires2FA.value) {
		viewConfirm.value = true
		isVisible.value = true
		return
	}
	isVisible.value = value
	if (value === false) {
		mode.value = 'login'
		requires2FA.value = false
		username.value = ''
		email.value = ''
		password.value = ''
		token2FA.value = ''
		errors.value = {}
	}
}

watch(
	isVisible,
	() => {
		authStore.signupError = ''
		authStore.loginError = ''
	}
)
</script>

<template>
	<Modal v-model="isVisible" @update:modelValue="requestClose" :title="mode === 'signup' ? t('signup.title') : t('login.title')">
		<div v-if="mode === 'signup'">
			<div class="flex flex-row mb-2 text-sm">
				<p class="text-gray-500 font-light">{{ t('signup.haveAccount') }}</p>
				<button
					type="button"
					@click="toggleMode"
					class="text-blue-600 ml-1"
				>
					{{ t('login.title') }}
				</button>
			</div>
			<FullForm @submit="onSignup">
				<FormField :label="t('signup.username')" v-model="username" :error="errors.username"></FormField>
				<FormField :label="t('signup.email')" v-model="email" type="email" :error="errors.email"></FormField>
				<FormField :label="t('signup.password')" v-model="password" type="password" :error="errors.password"></FormField>
				<ErrorMessage :error="authStore.signupError"></ErrorMessage>
				<AppButton :label="t('signup.submit')" type="submit"></AppButton>
				<hr>
				<OAuthButton @click="authStore.googleConnect" :label="t('signup.google')"></OAuthButton>
			</FullForm>
		</div>
		<div v-else>
			<FullForm @submit="onLogin" v-if="!requires2FA">
				<div class="flex flex-row mb-2 text-sm">
					<p class="text-gray-500 font-light">{{ t('login.dontHaveAccount') }}</p>
					<button
						type="button"
						@click="toggleMode"
						class="text-blue-600 ml-1"
					>
						{{ t('signup.title') }}
					</button>
				</div>
				<FormField :label="t('login.username')" v-model="username" :error="errors.username"></FormField>
				<FormField :label="t('login.password')" v-model="password" type="password"  :error="errors.password"></FormField>
				<ErrorMessage :error="authStore.loginError"></ErrorMessage>
				<AppButton :label="t('login.submit')" type="submit"></AppButton>
				<hr>
				<OAuthButton @click="authStore.googleConnect" :label="t('signup.google')"></OAuthButton>
			</FullForm>
			<div v-else>
				<p class="text-sm text-gray-600 mb-2">{{ t('login.2faPrompt') }}</p>
				<p v-if="authStore.loginError" class="text-red-600 text-sm mt-1">{{ authStore.loginError }}</p>
				<ErrorMessage :error="authStore.loginError"></ErrorMessage>
				<FullForm @submit="log2FA">
					<FormField v-model="token2FA" label="" :error="errors.token2FA" :placeholder="t('login.2faPlaceholder')"/>
					<AppButton :label="t('login.2faSubmit')" type="submit"></AppButton>
				</FullForm>
				<hr>
				<OAuthButton @click="authStore.googleConnect" :label="t('login.google')"></OAuthButton>
				<ConfirmDialogModal
					v-model:visible="viewConfirm"
					:title="t('login.confirm.2faTitle')"
					:message="t('login.confirm.2faMessage')"
					:ok-button="t('login.confirm.2faConfirm')"
					@confirm="onConfirmClose"
					@update:visible="(value) => { if (!value) onCancelClose() }"></ConfirmDialogModal>
			</div>
		</div>
	</Modal>
</template>
