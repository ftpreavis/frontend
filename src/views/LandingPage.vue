<script lang="ts" setup>
import { useLang } from "@/composables/useLang"
import CTAButton from "@/components/CallToActionButton.vue";

const { t } = useLang()
</script>

<template>
	<div class="bg-[#F8F6F0] h-screen">
		<div class="flex w-10/12 m-auto flex-col">
			<div class="mt-8">
				<h1 class="text-[50px] font-semibold">{{ t('landing.title') }}</h1>
				<p class="text-gray-600 mt-1">{{ t('landing.tagline') }}</p>
				<div class="flex flex-row items-center mt-4">
					<CTAButton to="/signup" class="">
						Play Now !
					</CTAButton>
				</div>
			</div>
		</div>

	</div>
</template>
