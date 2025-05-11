<script lang="ts">
	import { Label, Input, Textarea, Tabs, TabItem } from 'flowbite-svelte';
	//@ts-ignore
	import { Form } from 'svelte-yup';
	import { insertData } from '../../../stores/contactStor';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ContactModel, ContactModelLang } from '../../../models/contactModel';
	import { goto } from '$app/navigation';
	import { IconDeviceFloppy } from '@tabler/icons-svelte';

	export let data;
	let submitted = false;
	let showToast = false;

	interface ErrorMessages {
		email?: string;
		facebook_link?: string;
		instagram_link?: string;
		linkedin_link?: string;
		youtube_link?: string;
		twitter_link?: string;
		location?: string;
		phoneNumber_relations?: string;
		phoneNumber_Administration?: string;
		phoneNumber_Technical?: string;
		phoneNumber_marketing?: string;
	}
	let errorMessages: ErrorMessages = {};

	let selectedLanguageTab = LanguageEnum.EN;

	let contactInfoDataLang: ContactModelLang[] = [];
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);
	//

	const languageEnumLength = languageEnumKeys.length;

	for (let i = 0; i < languageEnumLength; i++) {
		contactInfoDataLang.push({
			location: '',
			email: '',
			phoneNumber_relations: '',
			phoneNumber_Technical: '',
			phoneNumber_Administration: '',
			phoneNumber_marketing: '',
			created_at: new Date(),
			language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
		});
	}

	let contactInfoObject: ContactModel = {
		facebook_link: '',
		instagram_link: '',
		linkedin_link: '',
		youtube_link: '',
		twitter_link: '',
		created_at: new Date()
	};

	async function formSubmit() {
		/** Add validation for contactInfoObject  **/
		const isEmptyContactInfoObject =
			contactInfoObject?.facebook_link?.trim() === '' &&
			contactInfoObject?.instagram_link?.trim() === '' &&
			contactInfoObject?.linkedin_link?.trim() === '' &&
			contactInfoObject?.youtube_link?.trim() === '' &&
			contactInfoObject?.twitter_link?.trim() === '';
		if (isEmptyContactInfoObject) {
			errorMessages = {
				...errorMessages,
				facebook_link:
					contactInfoObject.facebook_link.trim() === '' ? 'Please enter a Facebook link.' : '',
				instagram_link:
					contactInfoObject.instagram_link.trim() === '' ? 'Please enter an Instagram link.' : '',
				linkedin_link:
					contactInfoObject.linkedin_link.trim() === '' ? 'Please enter a LinkedIn link.' : '',
				youtube_link:
					contactInfoObject.youtube_link.trim() === '' ? 'Please enter a YouTube link.' : '',
				twitter_link:
					contactInfoObject.twitter_link.trim() === '' ? 'Please enter a Twitter link.' : ''
			};
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
		/** Add validation for contactInfoObject  **/

		/**Add validation for contactInfoDataLang **/
		const isEmpty = contactInfoDataLang.some((lang) => {
			const isEmptyField =
				lang?.location?.trim() === '' &&
				lang?.email?.trim() === '' &&
				lang?.phoneNumber_relations?.trim() === '' &&
				lang?.phoneNumber_Technical?.trim() === '' &&
				lang?.phoneNumber_Administration?.trim() === '' &&
				lang?.phoneNumber_marketing?.trim() === '';

			if (isEmptyField) {
				errorMessages = {
					...errorMessages,
					location: lang.location.trim() === '' ? 'Please enter a location.' : '',
					email: lang.email.trim() === '' ? 'Please enter an email.' : '',
					phoneNumber_relations:
						lang.phoneNumber_relations.trim() === ''
							? 'Please enter a relations phone number.'
							: '',
					phoneNumber_Technical:
						lang.phoneNumber_Technical.trim() === ''
							? 'Please enter a technical phone number.'
							: '',
					phoneNumber_Administration:
						lang.phoneNumber_Administration.trim() === ''
							? 'Please enter an administration phone number.'
							: '',
					phoneNumber_marketing:
						lang.phoneNumber_marketing.trim() === '' ? 'Please enter a marketing phone number.' : ''
				};
			} else {
				errorMessages = {
					...errorMessages,
					location: '',
					email: '',
					phoneNumber_relations: '',
					phoneNumber_Technical: '',
					phoneNumber_Administration: '',
					phoneNumber_marketing: ''
				};
			}

			// If email is not empty and not valid, add an error message for invalid format
			if (lang.email.trim() && !isValidEmail(lang.email.trim())) {
				errorMessages.email = 'Please enter a valid email address.';
				return true;
			}

			return isEmptyField;
		});
		/**Add validation for contactInfoDataLang **/

		if (!isEmptyContactInfoObject && !isEmpty) {
			submitted = true;
			showToast = true;

			insertData(contactInfoObject, contactInfoDataLang, data.supabase);
			resetForm();
			goto('/dashboard/contactInfo');
			setTimeout(() => {
				showToast = false;
			}, 1000);
		}
	}

	function isValidEmail(email: string) {
		// Use a regular expression to validate the email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function resetForm() {
		submitted = false;

		contactInfoObject = {
			facebook_link: '',
			instagram_link: '',
			linkedin_link: '',
			youtube_link: '',
			twitter_link: '',
			created_at: new Date()
		};

		contactInfoDataLang = []; // Resetting contactInfoDataLang to an empty array
		for (let i = 0; i < languageEnumLength; i++) {
			contactInfoDataLang.push({
				location: '',
				email: '',
				phoneNumber_relations: '',
				phoneNumber_Technical: '',
				phoneNumber_Administration: '',
				phoneNumber_marketing: '',
				created_at: new Date(),
				language: LanguageEnum[languageEnumKeys[i] as keyof typeof LanguageEnum]
			});
		}
	}
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-3 fixed bottom-0 left-0 right-0 shadow-lg flex items-center justify-center">
			<span class="font-medium">Contact information added successfully!</span>
		</div>
	{/if}
	<div class="max-w-screen-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
		<div class="mb-10 text-center">
			<h1 class="text-3xl font-bold text-gray-800 dark:text-white">Add Contact Information</h1>
			<p class="mt-2 text-gray-600 dark:text-gray-400">Create new contact details and social links</p>
		</div>

		<Form class="form" {submitted}>
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-8">
				<h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Social Media Links</h2>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div>
						<Label class="block">
							<span class="block mb-2 text-gray-700 dark:text-gray-300 font-medium">Facebook</span>
							<Input
								type="text"
								placeholder="Enter Facebook link"
								bind:value={contactInfoObject.facebook_link}
								id="facebook_link"
								name="facebook_link"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
							{#if !contactInfoObject.facebook_link.trim() && errorMessages['facebook_link']}
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
								bind:value={contactInfoObject.instagram_link}
								id="instagram_link"
								name="instagram_link"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
							{#if !contactInfoObject.instagram_link.trim() && errorMessages['instagram_link']}
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
								bind:value={contactInfoObject.linkedin_link}
								id="linkedin_link"
								name="linkedin_link"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
							{#if !contactInfoObject.linkedin_link.trim() && errorMessages['linkedin_link']}
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
								bind:value={contactInfoObject.youtube_link}
								id="youtube_link"
								name="youtube_link"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
							{#if !contactInfoObject.youtube_link.trim() && errorMessages['youtube_link']}
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
								bind:value={contactInfoObject.twitter_link}
								id="twitter_link"
								name="twitter_link"
								class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
							{#if !contactInfoObject.twitter_link.trim() && errorMessages['twitter_link']}
								<p class="error-message mt-2">{errorMessages['twitter_link']}</p>
							{/if}
						</Label>
					</div>
				</div>
			</div>

			<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
				<Tabs contentClass="dark:text-white bg-white dark:bg-gray-800" style="pill" class="p-4">
					{#each contactInfoDataLang as langData, index}
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
											Add data for <span class="uppercase">{`${langData.language}`}</span> language
										{/if}
									</h2>
									<p class="text-gray-500 dark:text-gray-400 text-sm">Navigate between tabs to add other languages</p>
								</div>

								<!-- Phone Numbers Section -->
								<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
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
													class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_relations.trim() && errorMessages['phoneNumber_relations']}
													<p class="error-message mt-2">{errorMessages['phoneNumber_relations']}</p>
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
													class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_Administration.trim() && errorMessages['phoneNumber_Administration']}
													<p class="error-message mt-2">{errorMessages['phoneNumber_Administration']}</p>
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
													class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_Technical.trim() && errorMessages['phoneNumber_Technical']}
													<p class="error-message mt-2">{errorMessages['phoneNumber_Technical']}</p>
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
													class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
												/>
												{#if !langData.phoneNumber_marketing.trim() && errorMessages['phoneNumber_marketing']}
													<p class="error-message mt-2">{errorMessages['phoneNumber_marketing']}</p>
												{/if}
											</Label>
										</div>
									</div>
								</div>

								<!-- Email Section -->
								<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
									<Label class="block">
										<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Contact Email</span>
										<Input
											id="email"
											type="text"
											placeholder="Enter email address"
											bind:value={langData.email}
											name="email"
											class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
										/>
										{#if !langData.email.trim() && errorMessages['email']}
											<p class="error-message mt-2">{errorMessages['email']}</p>
										{/if}
										{#if langData.email.trim() && !isValidEmail(langData.email.trim())}
											<p class="error-message mt-2">Please enter a valid email address</p>
										{/if}
									</Label>
								</div>

								<!-- Location Section -->
								<div class="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg mb-8">
									<Label class="block">
										<span class="font-medium text-gray-700 dark:text-gray-300 block mb-2">Location</span>
										<Textarea
											placeholder="Enter location"
											rows="4"
											bind:value={langData.location}
											id="location"
											name="location"
											class="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
										/>
										{#if !langData.location.trim() && errorMessages['location']}
											<p class="error-message mt-2">{errorMessages['location']}</p>
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
							Add Contact Info
						</button>
					</div>
				</div>
			</div>
		</Form>
	</div>
</div>

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
