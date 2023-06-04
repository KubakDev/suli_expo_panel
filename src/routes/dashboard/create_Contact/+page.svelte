<script lang="ts">
	import { Label, Input, Textarea, Tabs, TabItem } from 'flowbite-svelte';
	import * as yup from 'yup';
	import { Form, Message } from 'svelte-yup';
	import { insertData } from '../../../stores/contactStor';
	import { LanguageEnum } from '../../../models/languageEnum';
	import type { ContactModel, ContactModelLang } from '../../../models/contactModel';
	import DateInput from 'date-picker-svelte/DateInput.svelte';

	export let data;

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

	let submitted = false;
	let showToast = false;

	async function formSubmit() {
		submitted = true;
		showToast = true;

		insertData(contactInfoObject, contactInfoDataLang, data.supabase);
		resetForm();
		setTimeout(() => {
			showToast = false;
		}, 1000);
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

<div class="max-w-screen-2xl mx-auto">
	<div style="min-height: calc(100vh - 160px);" class="max-w-screen-2xl mx-auto bg-[#f1f3f4]">
		{#if showToast}
			<div class="bg-green-500 text-white text-center py-2 fixed bottom-0 left-0 right-0">
				successfully submitted
			</div>
		{/if}

		<div class="px-20 py-10">
			<Form class="form " {submitted}>
				<h1 class="text-xl font-bold mb-8">Contact Information Data</h1>

				<div class="grid gap-4 md:grid-cols-3 mt-8">
					<div>
						<Label class="space-y-2 mb-2">
							<div>
								<Label class="space-y-2 mb-2">
									<span>Date</span>
									<DateInput bind:value={contactInfoObject.created_at} format="yyyy/MM/dd" />
								</Label>
							</div>
						</Label>
					</div>

					<br />

					<div class="col-span-3">
						<Tabs>
							{#each contactInfoDataLang as langData}
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
</div>
