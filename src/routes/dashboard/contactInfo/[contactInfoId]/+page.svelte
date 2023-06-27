<script lang="ts">
	import { Label, Input, Fileupload, Textarea } from 'flowbite-svelte';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { updateData } from '../../../../stores/contactStor';
	import { LanguageEnum } from '../../../../models/languageEnum';
	import type { ContactModel, ContactModelLang } from '../../../../models/contactModel';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let data;
	let submitted = false;
	let showToast = false;

	let contactDataLang: ContactModelLang[] = [];
	let contactData: ContactModel = {
		id: 0,
		created_at: new Date()
	};
	const id = $page.params.contactInfoId;
	console.log($page.params);
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
		submitted = true;
		showToast = true;

		updateData(contactData, contactDataLang, data.supabase);

		setTimeout(() => {
			showToast = false;
		}, 1000);
		goto('/dashboard/contactInfo');
	}
</script>

<div style="min-height: calc(100vh - 160px);" class="grid grid-col-1 lg:grid-cols-3 bg-[#f1f3f4]">
	<div class="w-full h-full col-span-2 flex justify-center items-center">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				The Update Was Successfully!
			</div>
		{/if}

		<Form class="form py-10" {submitted}>
			<h1 class="text-xl font-bold mb-8">Update Contact Information</h1>

			<div class="grid gap-4 md:grid-cols-3 mt-8">
				<div class="col-span-3">
					<Tabs
						activeClasses="p-4 text-primary-500 bg-gray-100 rounded-t-lg dark:bg-gray-800 dark:text-primary-500"
					>
						{#each contactDataLang as langData}
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
											{#if langData.language === 'ar'}
												{`أضف البيانات إلى اللغة العربية`}
											{:else if langData.language === 'ckb'}
												{`زیاد کردنی داتا بە زمانی کوردی`}
											{:else}
												{`Add data for ${langData.language} language`}
											{/if}
										</h1>
										<p>for other language navigate between tabs</p>
									</div>
									<div class="flex items-center gap-2 py-10">
										<div class="w-full">
											<Label for="first_name" class="mb-2">Relations</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_relations}
												id="title"
												name="title"
											/>
											<!-- <Message name="title" /> -->
										</div>
										<div class="w-full">
											<Label for="first_name" class="mb-2">Administration</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Administration}
												id="title"
												name="title"
											/>
											<!-- <Message name="title" /> -->
										</div>
									</div>
									<div class="pb-10 flex items-center gap-2">
										<div class="w-full">
											<Label for="first_name" class="mb-2">Technical</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_Technical}
												id="title"
												name="title"
											/>
											<!-- <Message name="title" /> -->
										</div>
										<div class="w-full">
											<Label for="first_name" class="mb-2">Marketing</Label>
											<Input
												type="text"
												placeholder="Enter phoneNumber"
												bind:value={langData.phoneNumber_marketing}
												id="title"
												name="title"
											/>
											<!-- <Message name="title" /> -->
										</div>
									</div>
									<div class="pb-10">
										<Label for="first_name" class="mb-2">Contact Email Address</Label>
										<Input
											type="text"
											placeholder="Enter email address"
											bind:value={langData.email}
											id="title"
											name="title"
										/>
										<!-- <Message name="title" /> -->
									</div>
									<div class="pb-10">
										<Label for="textarea-id" class="mb-2">location</Label>
										<Textarea
											placeholder="Enter location"
											rows="4"
											bind:value={langData.location}
											id="subtitle"
											name="subtitle"
										/>
										<!-- <Message name="subtitle" /> -->
									</div>
								</div>
							</TabItem>
						{/each}
					</Tabs>
				</div>
				<div class="bg-gray-500 col-span-3 h-[1px] rounded-md" />

				<br />
			</div>

			<!-- button for submitForm -->
			<div class="w-full flex justify-end mt-2">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-blue-700 hover:bg-blue-500 text-white font-bold py-2 px-4 border border-blue-700 rounded"
				>
					Submit
				</button>
			</div>
		</Form>
	</div>
</div>
