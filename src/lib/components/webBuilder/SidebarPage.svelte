<script lang="ts">
	import { onMount } from 'svelte';
	import { Sidebar, SidebarDropdownWrapper, SidebarGroup, SidebarWrapper } from 'flowbite-svelte';
	import { CardType } from 'kubak-svelte-component';
	//@ts-ignore
	import { isEmpty } from 'validator';
	import { addNewToast } from '../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../models/toastTypeEnum';
	import { insertData, getData, theme } from '../../../stores/colorTheme';
	import {
		pageTheme,
		updatePageData,
		changeComponentType,
		changeTheme,
		changeCurrentTheme,
		selectedTheme
	} from '../../../stores/pageStore';
	import { getComponentData } from '../../../stores/componentStor';
	import { ModeTypeEnum } from '../../../models/colorTheme';

	let loading = false;
	export let data: any;
	export let openLightCard: boolean;

	let showToast = false;

	let showCustomColor_light: boolean = false;
	let showCustomColor_dark: boolean = false;
	let componentData: any = [];
	let light_theme_data: any = [];
	let dark_theme_data: any = [];

	let pageBuilder: any = {
		id: 0,
		componentId: 0,
		componentTypeId: 0,
		page: '',
		color_palette_id_lightMode: 0,
		color_palette_id_darkMode: 0,
		status: false
	};

	let customColors_light = {
		name: '',
		primaryColor: $selectedTheme?.primaryColor,
		secondaryColor: $selectedTheme?.secondaryColor,
		overlayPrimaryColor: $selectedTheme?.overlayPrimaryColor,
		overlaySecondaryColor: $selectedTheme?.overlaySecondaryColor,
		backgroundColor: $selectedTheme?.backgroundColor,
		overlayBackgroundColor: $selectedTheme?.overlayBackgroundColor,
		active: null,
		mode_type: ModeTypeEnum.LIGHT
	};

	let customColors_dark = {
		name: '',
		primaryColor: $selectedTheme?.primaryColor,
		secondaryColor: $selectedTheme?.secondaryColor,
		overlayPrimaryColor: $selectedTheme?.overlayPrimaryColor,
		overlaySecondaryColor: $selectedTheme?.overlaySecondaryColor,
		backgroundColor: $selectedTheme?.backgroundColor,
		overlayBackgroundColor: $selectedTheme?.overlayBackgroundColor,
		active: null,
		mode_type: ModeTypeEnum.DARK
	};

	// get component data
	let supabase = data.supabase;

	async function fetchComponentData() {
		let data = await getComponentData(supabase);
		componentData = data;
	}
	onMount(fetchComponentData);

	let cards = [
		{
			id: 0,
			cardName: 'flat',
			value: CardType.Flat,
			imgUrl: '../../../../images/cards/flat.png'
		},

		{
			id: 1,
			cardName: 'main',
			value: CardType.Main,
			imgUrl: '../../../../images/cards/main.png'
		},
		{
			id: 2,
			cardName: 'simple',
			value: CardType.Simple,
			imgUrl: '../../../../images/cards/simple.png'
		},
		{
			id: 3,
			cardName: 'square',
			value: CardType.Square,
			imgUrl: '../../../../images/cards/square.png'
		},
		{
			id: 4,
			cardName: 'video',
			value: CardType.Video,
			imgUrl: '../../../../images/cards/video.png'
		}
	];

	let colors = [
		'primaryColor',
		'overlayPrimaryColor',
		'secondaryColor',
		'overlaySecondaryColor',
		'backgroundColor',
		'overlayBackgroundColor'
	];

	$: showHomeStatus = $pageTheme?.status ?? false;

	// get color_palette data
	async function fetchData() {
		await getData(data.supabase);
	}
	onMount(fetchData);

	async function changeCardType(itemName: any) {
		const selectedComponent = componentData.find((item: any) => item.type === itemName) || null;
		let newPageTheme = $pageTheme;
		newPageTheme.componentTypeId = selectedComponent.id;
		newPageTheme.component_type = selectedComponent;
		changeComponentType(newPageTheme);
	}

	async function changePageTheme_light(currentTheme: any) {
		let newTheme = $pageTheme;
		newTheme.color_palette_id_lightMode = currentTheme.id;
		newTheme.color_palette_light = currentTheme;
		changeTheme(newTheme);
		changeCurrentTheme(newTheme?.color_palette_light);
		//
	}

	async function changePageTheme_dark(currentTheme: any) {
		let newTheme_dark = $pageTheme;
		newTheme_dark.color_palette_id_darkMode = currentTheme.id;
		newTheme_dark.color_palette_dark = currentTheme;
		changeTheme(newTheme_dark);
		changeCurrentTheme(newTheme_dark?.color_palette_dark);
	}

	//get dark theme and light theme data  from table
	$: {
		light_theme_data = $theme.filter((item) => item.mode_type === ModeTypeEnum.LIGHT);
		dark_theme_data = $theme.filter((item) => item.mode_type === ModeTypeEnum.DARK);
		//
	}

	//change theme data
	function changeThemeColor_light(customColors_light: any) {
		$selectedTheme.backgroundColor =
			customColors_light?.backgroundColor || $selectedTheme.backgroundColor;
		$selectedTheme.overlayBackgroundColor =
			customColors_light?.overlayBackgroundColor || $selectedTheme.overlayBackgroundColor;
		$selectedTheme.primaryColor = customColors_light?.primaryColor || $selectedTheme.primaryColor;
		$selectedTheme.overlayPrimaryColor =
			customColors_light?.overlayPrimaryColor || $selectedTheme.overlayPrimaryColor;
		$selectedTheme.secondaryColor =
			customColors_light?.secondaryColor || $selectedTheme.secondaryColor;
		$selectedTheme.overlaySecondaryColor =
			customColors_light?.overlaySecondaryColor || $selectedTheme.overlaySecondaryColor;
	}

	//change theme data
	function changeThemeColor_dark(customColors_dark: any) {
		$selectedTheme.backgroundColor =
			customColors_dark?.backgroundColor || $selectedTheme.backgroundColor;
		$selectedTheme.overlayBackgroundColor =
			customColors_dark?.overlayBackgroundColor || $selectedTheme.overlayBackgroundColor;
		$selectedTheme.primaryColor = customColors_dark?.primaryColor || $selectedTheme.primaryColor;
		$selectedTheme.overlayPrimaryColor =
			customColors_dark?.overlayPrimaryColor || $selectedTheme.overlayPrimaryColor;
		$selectedTheme.secondaryColor =
			customColors_dark?.secondaryColor || $selectedTheme.secondaryColor;
		$selectedTheme.overlaySecondaryColor =
			customColors_dark?.overlaySecondaryColor || $selectedTheme.overlaySecondaryColor;
	}

	//insert new color_palette_light
	async function insertNewColorPalette_light() {
		loading = true;

		// Validate the name field
		if (typeof customColors_light.name !== 'string' || isEmpty(customColors_light.name.trim())) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Theme Name cannot be empty',
				title: 'Error',
				duration: 1000
			});
			loading = false;
			return;
		}

		await insertData(customColors_light, data.supabase);
		fetchData();

		showCustomColor_light = !showCustomColor_light;
		showCustomColor_dark = !showCustomColor_dark;
		addNewToast({
			type: ToastTypeEnum.SUCCESS,
			message: 'New theme has been created successfully',
			title: 'Success',
			duration: 1000
		});
		loading = false;
	}

	//insert new color_palette_dark
	async function insertNewColorPalette_dark() {
		loading = true;

		// Validate the name field
		if (typeof customColors_dark.name !== 'string' || isEmpty(customColors_dark.name.trim())) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Theme Name cannot be empty',
				title: 'Error',
				duration: 1000
			});
			loading = false;
			return;
		}

		await insertData(customColors_dark, data.supabase);
		fetchData();
		showCustomColor_light = !showCustomColor_light;
		showCustomColor_dark = !showCustomColor_dark;
		addNewToast({
			type: ToastTypeEnum.SUCCESS,
			message: 'New theme has been created successfully',
			title: 'Success',
			duration: 1000
		});
		loading = false;
	}

	async function update() {
		showToast = true;
		pageBuilder.id = $pageTheme.id;
		pageBuilder.componentId = $pageTheme.componentId;
		pageBuilder.color_palette_id_darkMode = $pageTheme.color_palette_id_darkMode;
		pageBuilder.color_palette_id_lightMode = $pageTheme.color_palette_id_lightMode;
		pageBuilder.componentTypeId = $pageTheme.componentTypeId;
		pageBuilder.page = $pageTheme.page;
		pageBuilder.status = $pageTheme.status;

		await updatePageData(pageBuilder, data.supabase);
		setTimeout(() => {
			showToast = false;
		}, 1000);
	}

	//update page builder after changing the state of the checkbox state
	async function updateStatus(e: any) {
		const newStatus = e.target.checked;
		//
		pageBuilder.status = newStatus;
		pageBuilder.id = $pageTheme.id;
		pageBuilder.componentId = $pageTheme.componentId;
		pageBuilder.color_palette_id_darkMode = $pageTheme.color_palette_id_darkMode;
		pageBuilder.color_palette_id_lightMode = $pageTheme.color_palette_id_lightMode;
		pageBuilder.componentTypeId = $pageTheme.componentTypeId;
		pageBuilder.page = $pageTheme.page;
		$pageTheme.status = !$pageTheme.status;
		pageBuilder.status = $pageTheme.status;
		await updatePageData(pageBuilder, data.supabase);
	}
</script>

<!-- Show notification -->
{#if showToast}
	<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
		The Update Was Successfully!
	</div>
{/if}

<div class="text-gray-400 text-xs pt-1 pb-4 flex justify-start items-start w-full px-5">
	<input
		type="checkbox"
		class="w-4 h-4 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 focus:ring-2 mr-2 dark:bg-gray-700 dark:border-gray-600 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600"
		bind:checked={showHomeStatus}
		on:change={updateStatus}
	/>
	Show this page on home
</div>

<Sidebar style="width:300px" asideClass=" ">
	<SidebarWrapper divClass="px-8">
		<SidebarGroup ulClass="flex flex-col items-center gap-2 ">
			<SidebarDropdownWrapper
				label="Choose Card Type"
				btnClass="flex gap-5 py-2 px-4 rounded border border-gray-700 w-full"
			>
				<svelte:fragment slot="icon">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M21 8.25C21 7.5 20.25 6.75 19.5 6.75H4.5C3.75 6.75 3 7.5 3 8.25V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V8.25ZM4.5 2.25C2.84315 2.25 1.5 3.59315 1.5 5.25V18.75C1.5 20.4069 2.84315 21.75 4.5 21.75H19.5C21.1569 21.75 22.5 20.4069 22.5 18.75V5.25C22.5 3.59315 21.1569 2.25 19.5 2.25H4.5Z"
							fill="#373737"
						/>
					</svg>
				</svelte:fragment>
				<svelte:fragment slot="arrowup">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				</svelte:fragment>
				<svelte:fragment slot="arrowdown">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
				</svelte:fragment>
				<div class=" text-black dark:text-gray-400">
					<div class="grid grid-cols-2 gap-2">
						{#each cards as item, i}
							<button on:click={() => changeCardType(item.value)}>
								<img src={item.imgUrl} alt="card type" class="w-32 h-32 object-contain" />
								<p>{item.cardName}</p>
							</button>
						{/each}
					</div>
				</div>
			</SidebarDropdownWrapper>
			{#if openLightCard}
				<SidebarDropdownWrapper
					label="Choose light theme"
					btnClass="flex gap-5 py-2 px-2 rounded border border-gray-700 w-full"
				>
					<svelte:fragment slot="icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M20.4235 15.5625C20.3438 15.4734 20.2735 15.3937 20.2219 15.3328C20.0625 15.1453 19.8422 15.0281 19.5985 15.0047C19.35 14.9812 19.1063 15.0516 18.9141 15.2109C18.8672 15.2484 18.825 15.2906 18.7875 15.3375C18.7313 15.4031 18.6563 15.4875 18.5672 15.5859C17.8453 16.3922 16.5 17.9016 16.5 19.4625C16.5 21.1406 17.8453 22.5047 19.5 22.5047C21.1547 22.5047 22.5 21.1406 22.5 19.4625C22.5 17.8875 21.15 16.3734 20.4235 15.5625ZM19.5 21C18.675 21 18 20.3062 18 19.4578C18 18.5672 18.9188 17.4516 19.5047 16.7859C20.0906 17.4516 21 18.5672 21 19.4578C21 20.3062 20.325 21 19.5 21Z"
								fill="#373737"
							/>
							<path
								d="M17.911 14.7703H17.925C18.2063 14.7703 18.4734 14.6625 18.6703 14.4609C18.8719 14.2594 18.9797 13.9969 18.9797 13.7156C18.9797 13.4344 18.8672 13.1578 18.6656 12.9609L7.82345 2.20781C6.87658 1.25625 5.3297 1.25156 4.37814 2.20312L4.13439 2.44687C3.18283 3.39375 3.17814 4.94062 4.1297 5.89219L6.0797 7.84219L2.10939 11.8078C1.72033 12.1969 1.5047 12.7125 1.50001 13.2656C1.49533 13.8187 1.71095 14.3344 2.10001 14.7234C2.10939 14.7328 2.11876 14.7422 2.13283 14.7562L8.28283 20.6625C8.68595 21.0469 9.19689 21.2391 9.71251 21.2391C10.2281 21.2391 10.7485 21.0422 11.1469 20.6578L11.8078 20.0203C13.7625 18.1312 16.7063 15.2812 17.0906 14.8969C17.1141 14.8734 17.3063 14.7703 17.911 14.7703ZM5.18908 4.8375C4.82345 4.46719 4.82345 3.87656 5.18908 3.51094L5.43283 3.26719C5.79845 2.90156 6.39376 2.90156 6.75939 3.27187L8.71408 5.2125L7.13439 6.79219L5.18908 4.8375ZM16.036 13.8234C15.6891 14.1703 12.6094 17.1516 10.7672 18.9375L10.1063 19.575C9.88595 19.7859 9.54376 19.7859 9.32345 19.5797L3.17345 13.6734L3.16408 13.6641C3.05626 13.5562 3.00001 13.4156 3.00001 13.2656C3.00001 13.1156 3.06095 12.975 3.16876 12.8672L7.13908 8.90625L9.78283 6.2625L16.9406 13.3641C16.5563 13.4531 16.2563 13.6031 16.036 13.8234Z"
								fill="#373737"
							/>
						</svg>
					</svelte:fragment>
					<svelte:fragment slot="arrowup">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
					</svelte:fragment>
					<svelte:fragment slot="arrowdown">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
					</svelte:fragment>
					<div class="">
						<div class="py-2 text-center">
							<button
								class="font-normal w-full flex justify-center items-center transition-all ease-in-out border-primary-dark bg-gray-50 dark:bg-gray-900 text-black dark:text-white py-2 px-4 border hover:bg-primary-50 rounded"
								on:click={() => {
									showCustomColor_light = !showCustomColor_light;
								}}>{showCustomColor_light ? 'Cancel' : 'Add New Theme'}</button
							>
						</div>

						<div class="grid grid-cols-2 gap-2">
							{#if !showCustomColor_light && light_theme_data}
								{#each light_theme_data as color}
									<button
										class="shadow cursor-pointer border my-2 h-24 w-full rounded-md flex flex-col items-center justify-between"
										on:click={() => changePageTheme_light(color)}
									>
										<div
											class=" h-full w-full rounded border"
											style={`background-color:${color?.primaryColor}`}
										/>
										<p class="text-sm text-black dark:text-gray-400 py-2">{color.name}</p>
									</button>
								{/each}
							{/if}
						</div>

						<!-- create new light_theme_data -->
						{#if showCustomColor_light}
							<div class="grid grid-cols-4 py-2">
								<input
									class="dark:text-gray-900 col-span-3 border py-2 w-full px-2 rounded-l focus:outline-none focus:ring-0"
									id="default-input"
									placeholder="Enter theme name"
									bind:value={customColors_light.name}
								/>

								{#if showCustomColor_light}
									<button
										on:click|preventDefault={insertNewColorPalette_light}
										type="submit"
										class="shadow col-span-1 w-full flex justify-center items-center transition-all ease-in-out font-bold py-2 px-4 border border-primary-50 bg-primary-dark rounded-r"
									>
										<svg
											width="20px"
											height="20px"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#000000"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier">
												<title />
												<g id="Complete">
													<g data-name="add" id="add-2">
														<g>
															<line
																fill="none"
																stroke="#ffffff"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																x1="12"
																x2="12"
																y1="19"
																y2="5"
															/>
															<line
																fill="none"
																stroke="#ffffff"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																x1="5"
																x2="19"
																y1="12"
																y2="12"
															/>
														</g>
													</g>
												</g>
											</g></svg
										>
									</button>
								{/if}
							</div>
							<div class="h-96 w-full bg-background py-5">
								<div class="grid grid-cols-2 gap-3">
									{#each colors as color}
										<div class="rounded">
											<div class="shadow border rounded flex flex-col justify-center items-center">
												<div class="color-input-wrapper border">
													<input
														style="border-radius: 0.25rem;"
														class="w-full h-20"
														type="color"
														bind:value={customColors_light[color]}
														on:change={() => changeThemeColor_light(customColors_light)}
													/>
												</div>

												<p
													class="text-sm text-black dark:text-gray-400 py-2 flex flex-wrap px-2"
													style="word-break: break-word;"
												>
													{color}
												</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</SidebarDropdownWrapper>
			{:else}
				<SidebarDropdownWrapper
					label="Choose dark theme"
					btnClass="flex gap-5 py-2 px-2 rounded border border-gray-700 w-full"
				>
					<svelte:fragment slot="icon">
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M20.4235 15.5625C20.3438 15.4734 20.2735 15.3937 20.2219 15.3328C20.0625 15.1453 19.8422 15.0281 19.5985 15.0047C19.35 14.9812 19.1063 15.0516 18.9141 15.2109C18.8672 15.2484 18.825 15.2906 18.7875 15.3375C18.7313 15.4031 18.6563 15.4875 18.5672 15.5859C17.8453 16.3922 16.5 17.9016 16.5 19.4625C16.5 21.1406 17.8453 22.5047 19.5 22.5047C21.1547 22.5047 22.5 21.1406 22.5 19.4625C22.5 17.8875 21.15 16.3734 20.4235 15.5625ZM19.5 21C18.675 21 18 20.3062 18 19.4578C18 18.5672 18.9188 17.4516 19.5047 16.7859C20.0906 17.4516 21 18.5672 21 19.4578C21 20.3062 20.325 21 19.5 21Z"
								fill="#373737"
							/>
							<path
								d="M17.911 14.7703H17.925C18.2063 14.7703 18.4734 14.6625 18.6703 14.4609C18.8719 14.2594 18.9797 13.9969 18.9797 13.7156C18.9797 13.4344 18.8672 13.1578 18.6656 12.9609L7.82345 2.20781C6.87658 1.25625 5.3297 1.25156 4.37814 2.20312L4.13439 2.44687C3.18283 3.39375 3.17814 4.94062 4.1297 5.89219L6.0797 7.84219L2.10939 11.8078C1.72033 12.1969 1.5047 12.7125 1.50001 13.2656C1.49533 13.8187 1.71095 14.3344 2.10001 14.7234C2.10939 14.7328 2.11876 14.7422 2.13283 14.7562L8.28283 20.6625C8.68595 21.0469 9.19689 21.2391 9.71251 21.2391C10.2281 21.2391 10.7485 21.0422 11.1469 20.6578L11.8078 20.0203C13.7625 18.1312 16.7063 15.2812 17.0906 14.8969C17.1141 14.8734 17.3063 14.7703 17.911 14.7703ZM5.18908 4.8375C4.82345 4.46719 4.82345 3.87656 5.18908 3.51094L5.43283 3.26719C5.79845 2.90156 6.39376 2.90156 6.75939 3.27187L8.71408 5.2125L7.13439 6.79219L5.18908 4.8375ZM16.036 13.8234C15.6891 14.1703 12.6094 17.1516 10.7672 18.9375L10.1063 19.575C9.88595 19.7859 9.54376 19.7859 9.32345 19.5797L3.17345 13.6734L3.16408 13.6641C3.05626 13.5562 3.00001 13.4156 3.00001 13.2656C3.00001 13.1156 3.06095 12.975 3.16876 12.8672L7.13908 8.90625L9.78283 6.2625L16.9406 13.3641C16.5563 13.4531 16.2563 13.6031 16.036 13.8234Z"
								fill="#373737"
							/>
						</svg>
					</svelte:fragment>
					<svelte:fragment slot="arrowup">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15 11.25l-3-3m0 0l-3 3m3-3v7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
					</svelte:fragment>
					<svelte:fragment slot="arrowdown">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-6 h-6"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/></svg
						>
					</svelte:fragment>
					<div style="height: auto; width: 100%;">
						<div class="py-2 text-center">
							<button
								class="font-normal w-full flex justify-center items-center transition-all ease-in-out border-primary-dark bg-gray-50 dark:bg-gray-900 text-black dark:text-white py-2 px-4 border hover:bg-primary-50 rounded"
								on:click={() => {
									showCustomColor_dark = !showCustomColor_dark;
								}}>{showCustomColor_dark ? 'Cancel' : 'Add New Theme'}</button
							>
						</div>

						<div class="grid grid-cols-2 gap-2">
							{#if !showCustomColor_dark && dark_theme_data}
								{#each dark_theme_data as color}
									<button
										class="shadow cursor-pointer border my-2 h-24 w-full rounded-md flex flex-col items-center justify-between"
										on:click={() => changePageTheme_dark(color)}
									>
										<div
											class=" h-full w-full rounded border"
											style={`background-color:${color?.primaryColor}`}
										/>
										<p class="text-sm text-black dark:text-gray-400 py-2">{color.name}</p>
									</button>
								{/each}
							{/if}
						</div>

						<!-- create new dark_theme_data -->
						{#if showCustomColor_dark}
							<div class="grid grid-cols-4 py-2">
								<input
									class="dark:text-gray-900 col-span-3 border py-2 w-full px-2 rounded-l focus:outline-none focus:ring-0"
									id="default-input"
									placeholder="Enter theme name"
									bind:value={customColors_dark.name}
								/>

								{#if showCustomColor_dark}
									<button
										on:click|preventDefault={insertNewColorPalette_dark}
										type="submit"
										class="shadow col-span-1 w-full flex justify-center items-center transition-all ease-in-out font-bold py-2 px-4 border border-primary-50 bg-primary-dark rounded-r"
									>
										<svg
											width="20px"
											height="20px"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
											fill="#000000"
											><g id="SVGRepo_bgCarrier" stroke-width="0" /><g
												id="SVGRepo_tracerCarrier"
												stroke-linecap="round"
												stroke-linejoin="round"
											/><g id="SVGRepo_iconCarrier">
												<title />
												<g id="Complete">
													<g data-name="add" id="add-2">
														<g>
															<line
																fill="none"
																stroke="#ffffff"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																x1="12"
																x2="12"
																y1="19"
																y2="5"
															/>
															<line
																fill="none"
																stroke="#ffffff"
																stroke-linecap="round"
																stroke-linejoin="round"
																stroke-width="2"
																x1="5"
																x2="19"
																y1="12"
																y2="12"
															/>
														</g>
													</g>
												</g>
											</g></svg
										>
									</button>
								{/if}
							</div>
							<div class="h-96 w-full bg-background py-5">
								<div class="grid grid-cols-2 gap-3">
									{#each colors as color}
										<div class="rounded">
											<div class="shadow border rounded flex flex-col justify-center items-center">
												<div class="color-input-wrapper border">
													<input
														style="border-radius: 0.25rem;"
														class="w-full h-20"
														type="color"
														id="head"
														name="head"
														bind:value={customColors_dark[color]}
														on:change={() => changeThemeColor_dark(customColors_dark)}
													/>
												</div>

												<p
													class="text-sm text-black dark:text-gray-400 py-2 flex flex-wrap px-2"
													style="word-break: break-word;"
												>
													{color}
												</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</SidebarDropdownWrapper>
			{/if}
		</SidebarGroup>
	</SidebarWrapper>

	<div class="py-5 px-5">
		<button
			on:click={() => update()}
			class="w-full flex justify-center items-center transition-all ease-in-out text-white bg-primary-dark hover:bg-gray-50 hover:text-primary-dark font-bold py-2 px-4 border border-primary-50 rounded"
		>
			Update Page Theme
		</button>
	</div>
</Sidebar>

<style>
	.color-input-wrapper {
		height: 60px;
		width: 100%;
		overflow: hidden;
		border-radius: 5%;
		display: inline-flex;
		align-items: center;
		position: relative;
	}
	.color-input-wrapper input[type='color'] {
		position: absolute;
		height: 10em;
		width: 10em;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		overflow: hidden;
		border: none;
		margin: 0;
		padding: 0;
	}
</style>
