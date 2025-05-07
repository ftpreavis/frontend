<script lang="ts" setup>
// COURAGE
</script>

<template>
	<div class="w-4/5 m-auto border p-4 flex flex-col mt-20 shadow-xl">
		<h3 class="mb-3 text-center">Login</h3>
		<div class="border flex flex-col p-4 space-y-3">
			<form action="" class="flex flex-col justify-center space-y-3">
				<label>
					Username :
					<input type="text" class="border-2 rounded h-8 w-full">
				</label>
				<label>
					Password :
					<input type="password" class="border-2 rounded h-8 w-full">
				</label>
				<input type="submit" class="py-2 px-5 border rounded text-blue-600 shadow-md cursor-pointer" value="Login">
			</form>
			<hr>
			<button class="py-2 px-5 border rounded text-orange-400 shadow-md cursor-pointer">Google</button>
		</div>
	</div>
</template>
