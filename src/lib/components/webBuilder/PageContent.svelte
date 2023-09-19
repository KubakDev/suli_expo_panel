<script lang="ts">
	import { ExpoCard } from 'kubak-svelte-component';
	import { selectedTheme, pageTheme } from '../../../stores/pageStore';

	export let toggleMode: any;
	export let title: string;
</script>

<div style={`background-color:${$selectedTheme?.backgroundColor}`} class="min-h-screen py-5">
	<!-- change page theme colors -->
	<div class="flex justify-end items-center mr-5">
		<label class="relative inline-flex items-center cursor-pointer">
			<input on:change={toggleMode} type="checkbox" value="" class="sr-only peer" />
			<div
				class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 dark:peer-focus:ring-primary-100 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"
			/>
		</label>
	</div>

	<div class=" flex flex-col justify-center items-center px-4 pt-8 text-black">
		<div class="pt-3 pb-10">
			<div class="h-[1px] bg-yellow-400" />
			<h1
				style={`color:${$selectedTheme?.overlayBackgroundColor}`}
				class="  text-base sm:text-4xl font-bold uppercase text-center my-1 px-4 ms:px-10"
			>
				{title}
			</h1>

			<div class="h-[1px] bg-yellow-400" />
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
			{#each Array(6) as _}
				<ExpoCard
					cardType={$pageTheme?.component_type?.type}
					title="title"
					short_description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum"
					thumbnail=""
					primaryColor={$selectedTheme?.primaryColor}
					overlayPrimaryColor={$selectedTheme?.overlayPrimaryColor}
				/>
			{/each}
		</div>
	</div>
</div>
