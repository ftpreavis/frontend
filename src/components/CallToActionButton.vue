<script setup lang="ts">
import { defineProps } from 'vue'
import { RouterLink } from "vue-router";

defineProps({
	to: {
		type: [String, Object],
		required: false
	}
});
</script>

<template>
	<RouterLink
		:to="to"
		class="inline-block px-10 py-3 rounded-full font-semibold transition focus:outline-none focus:ring bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500">
		<slot></slot>
	</RouterLink>
</template>
