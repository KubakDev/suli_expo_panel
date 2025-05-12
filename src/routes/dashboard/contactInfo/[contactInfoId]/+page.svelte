<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	//@ts-ignore
	import { Form } from 'svelte-yup';
	import { updateData } from '../../../../stores/contactStor';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ContactModel, ContactModelLang } from '../../../../models/contactModel';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { IconDeviceFloppy } from '@tabler/icons-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let submitted = false;
	let showToast = false;
	let loaded = false;

	interface ErrorMessages {
		email?: string;
		facebook_link?: string;
		instagram_link?: string;
		linkedin_link?: string;
		youtube_link?: string;
		twitter_link?: string;
	}
	let errorMessages: ErrorMessages = {};

	let contactDataLang: ContactModelLang[] = [];
	let contactData: ContactModel = {
		id: 0,
		facebook_link: '',
		instagram_link: '',
		linkedin_link: '',
		youtube_link: '',
		twitter_link: '',
		created_at: new Date()
	};
	const id = $page.params.contactInfoId;
	//

	//**** get data from db and put it into the fields ****//
	async function getcontactData() {
		loaded = false;
		await data.supabase
			.from('contact_info')
			.select('*,contact_info_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				contactData = {
					id: result.data?.id,
					facebook_link: result.data?.facebook_link,
					instagram_link: result.data?.instagram_link,
					linkedin_link: result.data?.linkedin_link,
					youtube_link: result.data?.youtube_link,
					twitter_link: result.data?.twitter_link,
					created_at: new Date(result.data?.created_at)
				};

				for (let i = 0; i < languageEnumLength; i++) {
					const index = result.data?.contact_info_languages.findIndex(
						(contactInfoLang: ContactModelLang) =>
							contactInfoLang.language ==
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					);
					const contactInfoLang = result.data?.contact_info_languages[index];
					contactDataLang.push({
						location: contactInfoLang?.location ?? '',
						email: contactInfoLang?.email ?? '',
						phoneNumber_relations: contactInfoLang?.phoneNumber_relations ?? '',
						phoneNumber_Technical: contactInfoLang?.phoneNumber_Technical ?? '',
						phoneNumber_Administration: contactInfoLang?.phoneNumber_Administration ?? '',
						phoneNumber_marketing: contactInfoLang?.phoneNumber_marketing ?? '',
						language:
							contactInfoLang?.language ??
							LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
					});
				}
				contactDataLang = [...contactDataLang];
				contactData = { ...contactData };
				loaded = true;
			});
	}

	onMount(async () => {
		await getcontactData();
	});

	//** for swapping between languages**//
	let selectedLanguageTab = LanguageEnum.EN;
	const languageEnumKeys = Object.keys(LanguageEnum);
	const languageEnumLength = languageEnumKeys.length;
	//** for swapping between languages**//

	//**Handle submit**//
	async function formSubmit() {
		let isEmpty = false;
		// Validate contactDataLang
		for (let i = 0; i < contactDataLang.length; i++) {
			const lang = contactDataLang[i];
			const isEmptyField =
				lang?.location?.trim() === '' ||
				lang?.email?.trim() === '' ||
				lang?.phoneNumber_relations?.trim() === '' ||
				lang?.phoneNumber_Technical?.trim() === '' ||
				lang?.phoneNumber_Administration?.trim() === '' ||
				lang?.phoneNumber_marketing?.trim() === '';

			// If email is not empty and not valid, add an error message for invalid format
			if (lang.email.trim() && !isValidEmail(lang.email.trim())) {
				errorMessages.email = 'Please enter a valid email address.';
				isEmpty = true;
				break;
			}

			isEmpty = isEmpty || isEmptyField;
		}

		// Validate contactData
		const isEmptyContactData =
			contactData?.facebook_link?.trim() === '' ||
			contactData?.instagram_link?.trim() === '' ||
			contactData?.linkedin_link?.trim() === '' ||
			contactData?.youtube_link?.trim() === '' ||
			contactData?.twitter_link?.trim() === '';

		if (isEmptyContactData) {
			errorMessages = {
				...errorMessages,
				facebook_link:
					contactData.facebook_link.trim() === '' ? 'Please enter a Facebook link.' : '',
				instagram_link:
					contactData.instagram_link.trim() === '' ? 'Please enter an Instagram link.' : '',
				linkedin_link:
					contactData.linkedin_link.trim() === '' ? 'Please enter a LinkedIn link.' : '',
				youtube_link: contactData.youtube_link.trim() === '' ? 'Please enter a YouTube link.' : '',
				twitter_link: contactData.twitter_link.trim() === '' ? 'Please enter a Twitter link.' : ''
			};
			isEmpty = true;
		} else {
			errorMessages = {
				...errorMessages,
				facebook_link: '',
				instagram_link: '',
				linkedin_link: '',
				youtube_link: '',
				twitter_link: ''
			};
		}

		if (!isEmpty) {
			submitted = true;
			showToast = true;
			errorMessages = {};
			updateData(contactData, contactDataLang, data.supabase);

			setTimeout(() => {
				showToast = false;
				goto('/dashboard/contactInfo');
			}, 1000);
		}
	}

	function isValidEmail(email: string) {
		// Use a regular expression to validate the email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
</script>

{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div class="min-h-screen bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Contact information updated successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Update Contact Information</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Edit contact details and social links</p>
		</div>

		<Form class="form" {submitted}>
			<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-8">
				<h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Social Media Links</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Facebook</span>
							<Input
								type="text"
								placeholder="Enter Facebook link"
								bind:value={contactData.facebook_link}
								id="facebook_link"
								name="facebook_link"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
							{#if !contactData.facebook_link.trim() && errorMessages['facebook_link']}
								<p class="error-message mt-2">{errorMessages['facebook_link']}</p>
							{/if}
						</Label>
					</div>

					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Instagram</span>
							<Input
								type="text"
								placeholder="Enter Instagram link"
								bind:value={contactData.instagram_link}
								id="instagram_link"
								name="instagram_link"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
							{#if !contactData.instagram_link.trim() && errorMessages['instagram_link']}
								<p class="error-message mt-2">{errorMessages['instagram_link']}</p>
							{/if}
						</Label>
					</div>

					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">LinkedIn</span>
							<Input
								type="text"
								placeholder="Enter LinkedIn link"
								bind:value={contactData.linkedin_link}
								id="linkedin_link"
								name="linkedin_link"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
							{#if !contactData.linkedin_link.trim() && errorMessages['linkedin_link']}
								<p class="error-message mt-2">{errorMessages['linkedin_link']}</p>
							{/if}
						</Label>
					</div>

					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">YouTube</span>
							<Input
								type="text"
								placeholder="Enter YouTube link"
								bind:value={contactData.youtube_link}
								id="youtube_link"
								name="youtube_link"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
							{#if !contactData.youtube_link.trim() && errorMessages['youtube_link']}
								<p class="error-message mt-2">{errorMessages['youtube_link']}</p>
							{/if}
						</Label>
					</div>

					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Twitter</span>
							<Input
								type="text"
								placeholder="Enter Twitter link"
								bind:value={contactData.twitter_link}
								id="twitter_link"
								name="twitter_link"
								class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
							/>
							{#if !contactData.twitter_link.trim() && errorMessages['twitter_link']}
								<p class="error-message mt-2">{errorMessages['twitter_link']}</p>
							{/if}
						</Label>
					</div>
				</div>
			</div>

			<div class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}]" style="pill" class="p-4">
					{#each contactDataLang as langData}
						<TabItem
							open={langData.language == selectedLanguageTab}
							title={langData.language}
							on:click={() => {
								selectedLanguageTab = langData.language;
							}}
						>
							<div class="p-6 text-gray-700 dark:text-gray-200">
								<div class="text-center mb-8">
									<h2 class="text-xl font-semibold mb-2">
										{#if langData.language === 'ar'}
											{`أضف البيانات إلى اللغة العربية`}
										{:else if langData.language === 'ckb'}
											{`زیاد کردنی داتا بە زمانی کوردی`}
										{:else}
											{`English Language Content`}
										{/if}
									</h2>
									<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to edit other languages</p>
								</div>

								<!-- Phone Numbers Section -->
								<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
									<h3 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Department Phone Numbers</h3>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div>
											<Label class="block">
												<span class="block mb-2 text-gray-700 dark:text-gray-300">Relations</span>
												<Input
													type="text"
													placeholder="Enter phone number"
													bind:value={langData.phoneNumber_relations}
													id="phoneNumber_relations"
													name="phoneNumber_relations"
													class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_relations.trim()}
													<p class="error-message mt-2">Please enter a phone number for relations</p>
												{/if}
											</Label>
										</div>
										<div>
											<Label class="block">
												<span class="block mb-2 text-gray-700 dark:text-gray-300">Administration</span>
												<Input
													type="text"
													placeholder="Enter phone number"
													bind:value={langData.phoneNumber_Administration}
													id="phoneNumber_Administration"
													name="phoneNumber_Administration"
													class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_Administration.trim()}
													<p class="error-message mt-2">Please enter a phone number for administration</p>
												{/if}
											</Label>
										</div>
									</div>
									<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<Label class="block">
												<span class="block mb-2 text-gray-700 dark:text-gray-300">Technical</span>
												<Input
													type="text"
													placeholder="Enter phone number"
													bind:value={langData.phoneNumber_Technical}
													id="phoneNumber_Technical"
													name="phoneNumber_Technical"
													class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_Technical.trim()}
													<p class="error-message mt-2">Please enter a phone number for technical</p>
												{/if}
											</Label>
										</div>
										<div>
											<Label class="block">
												<span class="block mb-2 text-gray-700 dark:text-gray-300">Marketing</span>
												<Input
													type="text"
													placeholder="Enter phone number"
													bind:value={langData.phoneNumber_marketing}
													id="phoneNumber_marketing"
													name="phoneNumber_marketing"
													class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_marketing.trim()}
													<p class="error-message mt-2">Please enter a phone number for marketing</p>
												{/if}
											</Label>
										</div>
									</div>
								</div>

								<!-- Email Section -->
								<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
									<Label class="block">
										<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Contact Email</span>
										<Input
											id="email"
											type="text"
											placeholder="Enter email address"
											bind:value={langData.email}
											name="email"
											class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
										/>
										{#if !langData.email.trim()}
											<p class="error-message mt-2">Please enter an email</p>
										{/if}
										{#if langData.email.trim() && !isValidEmail(langData.email.trim())}
											<p class="error-message mt-2">Please enter a valid email address</p>
										{/if}
									</Label>
								</div>

								<!-- Location Section -->
								<div class="bg-gray-50 dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] p-5 rounded-lg mb-8">
									<Label class="block">
										<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Location</span>
										<Textarea
											placeholder="Enter location"
											rows="4"
											bind:value={langData.location}
											id="location"
											name="location"
											class="dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] dark:border-gray-600 dark:text-white"
										/>
										{#if !langData.location.trim()}
											<p class="error-message mt-2">Please enter a location</p>
										{/if}
									</Label>
								</div>
							</div>
						</TabItem>
					{/each}
				</Tabs>

				<div class="border-t dark:border-gray-700 mt-2 pt-6 px-6">
					<!-- Submit Button -->
					<div class="flex justify-end my-6">
						<button
							on:click|preventDefault={formSubmit}
							type="submit"
							class="bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors duration-200 flex items-center gap-2"
						>
							<IconDeviceFloppy size={20} />
							Update Contact Info
						</button>
					</div>
				</div>
			</div>
		</Form>
	</div>
</div>
{/if}

<style>
	.error-message {
		color: #ef4444;
		font-size: 0.875rem;
		margin-top: 0.5rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	
	.error-message::before {
		content: '!';
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		background-color: #ef4444;
		color: white;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: bold;
	}
</style>
