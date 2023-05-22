<script lang="ts">
	import { Label, Button, Input, Fileupload, Textarea, Helper, Spinner } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import { supabaseStore } from '../../../stores/supabaseStore';
	import { onMount } from 'svelte';
	import { getServiceUi } from '../../../stores/ui/serviceUi';
	import serviceUiStore from '../../../stores/ui/serviceUi';
	import { ImgSourceEnum } from '../../../models/imgSourceEnum';
	import * as yup from 'yup';
	import loading from '../../../stores/loading';
	import { changeLoadingStatus } from '../../../stores/loading';
	import { goto } from '$app/navigation';
	import ColorPicker from 'svelte-awesome-color-picker';
	import type { Service } from '../../../models/service';
	import { LanguageEnum } from '../../../models/languageEnum';

	export let data;
	let CardComponent: any;
	let thumbnailFile: File | undefined;
	let sliderImagesFile: File[] = [];
	$: serviceCardComponent = CardComponent;

	let invalidateFields: {
		title: boolean;
		short_description: boolean;
		thumbnail: boolean;
	} = {
		title: false,
		short_description: false,
		thumbnail: false
	};
	$: customColors = {
		primaryColor: $serviceUiStore?.color_palette?.primaryColor,
		onPrimaryColor: $serviceUiStore?.color_palette?.onPrimaryColor
	};
	const schema = yup.object().shape({
		title: yup.string().required(),
		short_description: yup.string().required(),
		thumbnail: yup.string().required()
	});
	let serviceData: Service = {
		service_languages: [
			{
				title: '',
				short_description: '',
				language: LanguageEnum.CKB
			}
		],
		thumbnail: ''
	};
	let serviceLanguageData: {
		title: string;
		short_description: string;
		language: string;
	}[] = [
		{
			title: '',
			short_description: '',
			language: 'en'
		},
		{
			title: '',
			short_description: '',
			language: 'ckb'
		},
		{
			title: '',
			short_description: '',
			language: 'ar'
		}
	];
	let selectedLanguageTab = 'en';
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const file = fileInput!.files![0];
		thumbnailFile = file;
		const reader = new FileReader();
		reader.onloadend = () => {
			serviceData.thumbnail = reader.result as string;
			serviceData.imgSource = ImgSourceEnum.local;
		};
		reader.readAsDataURL(file);
	}
	function getRandomTextNumber() {
		const random =
			Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
		return random;
	}
	async function submitForm(e: Event) {
		serviceData.primaryColor = customColors.primaryColor;
		serviceData.onPrimaryColor = customColors.onPrimaryColor;
		console.log(serviceLanguageData);
		console.log(serviceData);
		invalidateFields = {
			title: false,
			short_description: false,
			thumbnail: false
		};
		e.preventDefault();
		if (!data.supabase) return;
		const fileName = `${getRandomTextNumber()}.${thumbnailFile?.name.split('.').pop()}`;
		const response = await data.supabase.storage
			.from('image')
			.upload(`images/${fileName}`, thumbnailFile!);
		serviceData.thumbnail = response.data?.path!;
		if (response) {
			await data.supabase.rpc('insert_service_and_service_lang', {
				service_data: {
					thumbnail: serviceData.thumbnail,
					primaryColor: serviceData.primaryColor,
					onPrimaryColor: serviceData.onPrimaryColor
				},
				service_lang_data: serviceLanguageData
			});

			goto('/dashboard/service');
			changeLoadingStatus(false);
		}
	}
	onMount(async () => {
		serviceCardComponent = CardComponent;
		const supabase = $supabaseStore;
		if (!supabase) return;
		await getServiceUi(supabase);
		let card = $serviceUiStore?.component?.title;
		const module = await import('kubak-svelte-component');

		CardComponent = module[card as keyof typeof module];
	});
</script>

<div
	style="min-height: calc(100vh - 160px);"
	class="grid sm:grid-col-2 xl:grid-cols-3 bg-[#f1f3f4] create-service"
>
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		<form class="py-10">
			<h1 class="text-xl font-bold mb-8">Service Data</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<div class="">
					<Label class="space-y-2 mb-2">
						<Label
							for="first_name"
							class="mb-4"
							color={invalidateFields.thumbnail ? 'red' : undefined}>upload Card Image</Label
						>
						<Fileupload
							on:change={handleFileUpload}
							color={invalidateFields.thumbnail ? 'red' : 'base'}
						/>
						{#if invalidateFields.thumbnail}
							<Helper class="mt-2" color="red">
								<span class="font-medium">thumbnail is required!</span>
							</Helper>
						{/if}
					</Label>
				</div>
				<div class="flex justify-around w-full col-span-2">
					<div class="w-full px-6 flex flex-col items-center justify-center">
						<Label class="text-sm pb-6">Background Color</Label>
						<ColorPicker
							hex="#985151"
							label=""
							on:input={(value) => {
								customColors.primaryColor = value.detail.hex;
							}}
						/>
					</div>
					<div class="w-full px-6 flex flex-col items-center justify-center">
						<Label class="text-sm pb-6">Text Color</Label>
						<ColorPicker
							hex="#985151"
							label=""
							on:input={(value) => {
								customColors.onPrimaryColor = value.detail.hex;
							}}
						/>
					</div>
				</div>

				<br />
				<div class="col-span-3">
					<Tabs>
						{#each serviceLanguageData as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-10 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl font-bold">
											{`add data for ${langData.language} language`}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="pb-10">
										<Label
											for="first_name"
											class="mb-2"
											color={invalidateFields.title ? 'red' : undefined}>Card Title</Label
										>
										<Input
											type="text"
											placeholder="The Story"
											bind:value={langData.title}
											color={invalidateFields.title ? 'red' : 'base'}
										/>
										{#if invalidateFields.title}
											<Helper class="mt-2" color="red">
												<span class="font-medium">title is required!</span>
											</Helper>
										{/if}
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">short description</Label>
										<Textarea
											id="textarea-id"
											placeholder="short description"
											rows="4"
											name="message"
											bind:value={langData.short_description}
										/>
										{#if invalidateFields.short_description}
											<Helper class="mt-2" color="red"
												><span class="font-medium">short description is required!</span>
											</Helper>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
			</div>
			<div class="w-full flex justify-end mt-2">
				<Button on:click={submitForm} class="my-2 "
					>{#if $loading}
						<Spinner class="mr-3" size="4" />
					{/if}Submit</Button
				>
			</div>
		</form>
	</div>

	<div class=" h-full p-2">
		{#if $serviceUiStore}
			<div
				class=" w-full bg-[#3E4248] rounded-md p-10 flex justify-center items-center"
				style="min-height: calc(100vh - 300px);"
			>
				<div class="w-[600px]">
					{#if serviceCardComponent}
						<svelte:component
							this={serviceCardComponent}
							data={serviceLanguageData.find((item) => item.language == selectedLanguageTab)}
							imageData={{
								thumbnail: serviceData.thumbnail,
								imgSource: serviceData.imgSource
							}}
							colors={customColors}
						/>
					{:else}
						<div />
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="scss">
</style>
