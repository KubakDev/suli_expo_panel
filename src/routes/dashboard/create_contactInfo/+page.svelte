<script lang="ts">
	import { Label, Input, Textarea, Tabs, TabItem } from 'flowbite-svelte';
	//@ts-ignore
	import { Form } from 'svelte-yup';
	import { insertData } from '../../../stores/contactStor';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ContactModel, ContactModelLang } from '../../../models/contactModel';
	import { goto } from '$app/navigation';

	export let data;
	let submitted = false;
	let showToast = false;
	let errorMessages: any = {};
	let selectedLanguageTab = LanguageEnum.EN;

	let contactInfoDataLang: ContactModelLang[] = [];
	// Calculate the length of LanguageEnum
	const languageEnumKeys = Object.keys(LanguageEnum);
	// console.log(languageEnumKeys);

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
		created_at: new Date()
	};

	async function formSubmit() {
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

		if (!isEmpty) {
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

	function isValidEmail(email: any) {
		// Use a regular expression to validate the email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function resetForm() {
		submitted = false;

		contactInfoObject = {
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

<div style="min-height: calc(100vh - 160px);" class="max-w-screen-xl mx-auto">
	{#if showToast}
		<div class="z-40 bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			successfully submitted
		</div>
	{/if}
	<h1 class="pt-20 text-2xl font-bold flex justify-center">Contact Information Data</h1>

	<div class="px-10 lg:px-20 py-10 border m-10 bg-white rounded-lg">
		<Form class="form " {submitted}>
			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<br />

				<div class="col-span-3">
					<Tabs>
						{#each contactInfoDataLang as langData, index}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="py-5">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl text-gray-700 font-bold">
											{#if langData.language === 'ar'}
												{`أضف البيانات إلى اللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`زیاد کردنی داتا بە زمانی کوردی`}
											{:else}
												Add data for <span class="uppercase">{`${langData.language}`}</span> language
											{/if}
										</h1>
										<p class="text-gray-400 text-base">for other language navigate between tabs</p>
									</div>
									<div class="lg:flex items-center gap-2 lg:py-10">
										<div class="w-full h-16 mb-8 lg:mb-0">
											<Label for="relations" class="mb-2">Relations</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_relations}
												id="phoneNumber_relations"
												name="phoneNumber_relations"
											/>

											{#if !langData.phoneNumber_relations.trim() && errorMessages['phoneNumber_relations']}
												<p class="error-message">{errorMessages['phoneNumber_relations']}</p>
											{/if}
										</div>
										<div class="w-full h-16 mb-8 lg:mb-0">
											<!-- Set a fixed minimum height of 100 pixels -->
											<Label for="administration" class="mb-2">Administration</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Administration}
												id="phoneNumber_Administration"
												name="phoneNumber_Administration"
											/>
											{#if !langData.phoneNumber_Administration.trim() && errorMessages['phoneNumber_Administration']}
												<p class="error-message">{errorMessages['phoneNumber_Administration']}</p>
											{/if}
										</div>
									</div>
									<div class="pb-10 lg:flex items-center gap-2">
										<div class="w-full h-16 mb-8 lg:mb-0">
											<Label for="technical" class="mb-2">Technical</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Technical}
												id="phoneNumber_Technical"
												name="phoneNumber_Technical"
											/>
											{#if !langData.phoneNumber_Technical.trim() && errorMessages['phoneNumber_Technical']}
												<p class="error-message">{errorMessages['phoneNumber_Technical']}</p>
											{/if}
										</div>
										<div class="w-full h-16 mb-8 lg:mb-0">
											<Label for="first_name" class="mb-2">Marketing</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_marketing}
												id="phoneNumber_marketing"
												name="phoneNumber_marketing"
											/>
											{#if !langData.phoneNumber_marketing.trim() && errorMessages['phoneNumber_marketing']}
												<p class="error-message">{errorMessages['phoneNumber_marketing']}</p>
											{/if}
										</div>
									</div>
									<div class="pb-10 h-32">
										<Label for="first_name" class="mb-2">Contact Email Address</Label>
										<Input
											id="email"
											type="text"
											placeholder="Enter email address"
											bind:value={langData.email}
											name="email"
										/>
										{#if !langData.email.trim() && errorMessages['email']}
											<p class="error-message">{errorMessages['email']}</p>
										{/if}
										{#if langData.email.trim() && !isValidEmail(langData.email.trim())}
											<p class="error-message">Please enter a valid email address.</p>
										{/if}
									</div>
									<div class="pb-10 h-32">
										<Label for="location" class="mb-2">location</Label>
										<Textarea
											placeholder="Enter location"
											rows="4"
											bind:value={langData.location}
											id="location"
											name="location"
										/>
										{#if !langData.location.trim() && errorMessages['location']}
											<p class="error-message">{errorMessages['location']}</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>

				<br />
			</div>

			<div class="w-full flex justify-end px-4">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
				>
					Add
				</button>
			</div>
		</Form>
	</div>
</div>

<style>
	.error-message {
		color: red;
	}
</style>
