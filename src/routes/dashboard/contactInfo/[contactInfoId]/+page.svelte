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

	export let data;
	let submitted = false;
	let showToast = false;
	let errorMessages: any = {};
	let contactDataLang: ContactModelLang[] = [];
	let contactData: ContactModel = {
		id: 0,
		created_at: new Date()
	};
	const id = $page.params.contactInfoId;
	// console.log($page.params);

	//**** get data from db and put it into the fields ****//
	async function getcontactData() {
		await data.supabase
			.from('contact_info')
			.select('*,contact_info_languages(*)')
			.eq('id', id)
			.single()
			.then((result) => {
				contactData = {
					id: result.data?.id,
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
			console.log(isEmptyField);
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

		console.log(errorMessages); // Optional: Check errorMessages object
	}

	function isValidEmail(email: string) {
		// Use a regular expression to validate the email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}
</script>

<div style="min-height: calc(100vh - 160px);" class="max-w-screen-xl mx-auto">
	{#if showToast}
		<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
			successfully submitted
		</div>
	{/if}

	<div class="px-5 lg:px-20 py-10 border m-10 bg-white shadow rounded-lg">
		<Form class="form " {submitted}>
			<h1 class="text-2xl font-bold py-2 flex justify-center text-gray-700">
				Contact Information Data
			</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<div class="col-span-3">
					<Tabs>
						{#each contactDataLang as langData}
							<TabItem
								open={langData.language == selectedLanguageTab}
								title={langData.language}
								on:click={() => {
									selectedLanguageTab = langData.language;
								}}
							>
								<div class="px-5 py-16">
									<div class="text-center w-full pb-5">
										<h1 class="text-xl font-bold">
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
										<div class="w-full h-16 mb-5">
											<Label for="relations" class="mb-2">Relations</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_relations}
												id="phoneNumber_relations"
												name="phoneNumber_relations"
											/>
											{#if !langData.phoneNumber_relations.trim()}
												<p class="error-message">Please enter a phone number for relations</p>
											{/if}
										</div>
										<div class="w-full h-16 mb-5">
											<Label for="administration" class="mb-2">Administration</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Administration}
												id="phoneNumber_Administration"
												name="phoneNumber_Administration"
											/>
											{#if !langData.phoneNumber_Administration.trim()}
												<p class="error-message">Please enter a phone number for administration</p>
											{/if}
										</div>
									</div>
									<div class="pb-10 lg:flex items-center gap-2">
										<div class="w-full h-16 mb-5">
											<Label for="technical" class="mb-2">Technical</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Technical}
												id="phoneNumber_Technical"
												name="phoneNumber_Technical"
											/>
											{#if !langData.phoneNumber_Technical.trim()}
												<p class="error-message">Please enter a phone number for technical</p>
											{/if}
										</div>
										<div class="w-full h-16 mb-5">
											<Label for="phoneNumber_marketing" class="mb-2">Marketing</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_marketing}
												id="phoneNumber_marketing"
												name="phoneNumber_marketing"
											/>
											{#if !langData.phoneNumber_marketing.trim()}
												<p class="error-message">Please enter a phone number for marketing</p>
											{/if}
										</div>
									</div>
									<div class="pb-10 h-32">
										<Label for="email" class="mb-2">Contact Email Address</Label>
										<Input
											id="email"
											type="text"
											placeholder="Enter email address"
											bind:value={langData.email}
											name="email"
										/>
										{#if !langData.email.trim()}
											<p class="error-message">Please enter an email</p>
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
										{#if !langData.location.trim()}
											<p class="error-message">Please enter a phone number for location</p>
										{/if}
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />
				<br />
			</div>

			<div class="w-full flex justify-end">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-primary-dark hover:bg-gray-50 hover:text-primary-dark text-white font-bold py-2 px-4 border border-primary-50 rounded"
				>
					Update
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
