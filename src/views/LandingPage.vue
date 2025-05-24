<script lang="ts" setup>
import { useLang } from "@/composables/useLang"

const { t } = useLang()
</script>

<template>
	<div class="bg-[#F8F6F0] h-screen">
		<div class="flex w-10/12 m-auto">
			<div>
				<h1 class="text-[60px]">{{ t('landing.title') }}</h1>
				<p>{{ t('landing.tagline') }}</p>
			</div>
		</div>
	</div>
</template>
