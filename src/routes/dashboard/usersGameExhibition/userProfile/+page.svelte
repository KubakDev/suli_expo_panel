<script lang="ts">
	import { TabItem, Tabs, Button, Input, Textarea } from 'flowbite-svelte';
	import { goto } from '$app/navigation';
	import { Modal } from 'flowbite-svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';

	export let data;
	let userId = 1;
	let userProfile: any = {
		id: null,
		name: '',
		companyName: '',
		fieldWork: '',
		jobGrade: '',
		phoneNumber: '',
		email: '',
		country: '',
		city: '',
		referrer_name: '',
		hotelBooking: '',
		title: {
			en: '',
			ar: '',
			ckb: ''
		},
		emailSubject: {
			en: '',
			ar: '',
			ckb: ''
		},
		emailDescription: {
			en: '',
			ar: '',
			ckb: ''
		}
	};

	let includeFields: any = {
		name: false,
		companyName: false,
		fieldWork: false,
		jobGrade: false,
		phoneNumber: false,
		email: false,
		country: false,
		city: false,
		referrer_name: false,
		hotelBooking: false
	};

	const fetchUserProfile = async () => {
		const { data: userProfileData, error } = await data.supabase
			.from('userProfileGameExhibition')
			.select('*')
			.eq('id', userId)
			.single();

		if (error) {
			console.error('Error fetching data:', error);
		} else {
			userProfile = { ...userProfile, ...userProfileData };
			userProfile.title = JSON.parse(userProfile.title);
			userProfile.emailSubject = JSON.parse(userProfile.emailSubject);
			userProfile.emailDescription = JSON.parse(userProfile.emailDescription);

			Object.keys(includeFields).forEach((key) => {
				includeFields[key] = userProfile[key] === 'true';
			});
		}
	};

	const handleSubmit = async () => {
		const dataToSubmit: any = {};

		Object.keys(includeFields).forEach((key) => {
			dataToSubmit[key] = includeFields[key] ? 'true' : 'false';
		});

		dataToSubmit.title = JSON.stringify(userProfile.title);
		dataToSubmit.emailSubject = JSON.stringify(userProfile.emailSubject);
		dataToSubmit.emailDescription = JSON.stringify(userProfile.emailDescription);

		let response;
		if (userProfile.id) {
			response = await data.supabase
				.from('userProfileGameExhibition')
				.update(dataToSubmit)
				.eq('id', userProfile.id);
		} else {
			response = await data.supabase.from('userProfileGameExhibition').insert([dataToSubmit]);
		}

		if (response.error) {
			console.error('Error submitting data:', response.error);
		} else {
			alert('Data submitted successfully!');
			goto(`/dashboard/usersGameExhibition`);
		}
	};

	fetchUserProfile();
</script>

<form on:submit|preventDefault={handleSubmit} class="border dark:border-gray-700 dark:text-gray-100 rounded-lg shadow-lg bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}] w-full max-w-5xl mx-auto">
	<div class="container mx-auto p-4 flex flex-col justify-center">
		<Tabs contentClass="dark:text-white bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]" style="pill" class="p-4">
			<TabItem title="EN" open>
				<form
					on:submit|preventDefault={handleSubmit}
					class="border dark:border-gray-700 dark:text-gray-100 rounded-lg p-4 w-full bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]"
				>
					<p class="text-center py-2 font-semibold text-gray-700 dark:text-gray-200">Add form data for EN language</p>
					<div class="form-group">
						<label for="title-en" class="text-gray-700 dark:text-gray-300">Title</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="title-en"
							type="text"
							bind:value={userProfile.title.en}
							placeholder="Enter title in English"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-en" class="text-gray-700 dark:text-gray-300">Email Subject</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-subject-en"
							type="text"
							bind:value={userProfile.emailSubject.en}
							placeholder="Enter email subject in English"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-en" class="text-gray-700 dark:text-gray-300">Email Description</label>
						<Textarea
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-description-en"
							bind:value={userProfile.emailDescription.en}
							placeholder="Enter email description in English"
						/>
					</div>
				</form>
			</TabItem>
			<TabItem title="AR">
				<form
					on:submit|preventDefault={handleSubmit}
					class="border dark:border-gray-700 dark:text-gray-100 rounded-lg p-4 w-full bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]"
				>
					<p class="text-center py-2 font-semibold text-gray-700 dark:text-gray-200">Add data for AR language</p>
					<div class="form-group">
						<label for="title-ar" class="text-gray-700 dark:text-gray-300">Title</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="title-ar"
							type="text"
							bind:value={userProfile.title.ar}
							placeholder="Enter title in Arabic"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-ar" class="text-gray-700 dark:text-gray-300">Email Subject</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-subject-ar"
							type="text"
							bind:value={userProfile.emailSubject.ar}
							placeholder="Enter email subject in Arabic"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-ar" class="text-gray-700 dark:text-gray-300">Email Description</label>
						<Textarea
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-description-ar"
							bind:value={userProfile.emailDescription.ar}
							placeholder="Enter email description in Arabic"
						/>
					</div>
				</form>
			</TabItem>
			<TabItem title="CKB">
				<form
					on:submit|preventDefault={handleSubmit}
					class="border dark:border-gray-700 dark:text-gray-100 rounded-lg p-4 w-full bg-gray-50 dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]"
				>
					<p class="text-center py-2 font-semibold text-gray-700 dark:text-gray-200">Add data for CKB language</p>
					<div class="form-group">
						<label for="title-ckb" class="text-gray-700 dark:text-gray-300">Title</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="title-ckb"
							type="text"
							bind:value={userProfile.title.ckb}
							placeholder="Enter title in Kurdish"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-ckb" class="text-gray-700 dark:text-gray-300">Email Subject</label>
						<Input
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-subject-ckb"
							type="text"
							bind:value={userProfile.emailSubject.ckb}
							placeholder="Enter email subject in Kurdish"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-ckb" class="text-gray-700 dark:text-gray-300">Email Description</label>
							<Textarea
							class="rounded bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_HEADER}] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 w-full"
							id="email-description-ckb"
							bind:value={userProfile.emailDescription.ckb}
							placeholder="Enter email description in Kurdish"
						/>
					</div>
				</form>
			</TabItem>
		</Tabs>
		
		<div class="my-6 w-full">
			<h2 class="text-xl font-bold text-center text-gray-700 dark:text-gray-200">Required Fields Settings</h2>
			<div class="mt-4 p-6 border dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}]">
				<p class="text-center font-semibold mb-4 text-gray-700 dark:text-gray-300 pb-4">Select required fields for user profiles</p>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each Object.keys(includeFields) as key}
						<div class="form-group mx-2 mb-3">
							<label class="flex items-center text-gray-700 dark:text-gray-300">
								<input
									class:active-checkbox={includeFields[key]}
									class="mr-3"
									type="checkbox"
									checked={includeFields[key]}
									on:change={(e) => (includeFields[key] = e.target instanceof HTMLInputElement ? e.target.checked : false)}
								/>
								<span>{key.charAt(0).toUpperCase() + key.slice(1)} is Required</span>
							</label>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
		<div class="border-t border-gray-200 dark:border-gray-700" />
		<div class="flex justify-end w-full mt-5">
			<Button type="submit" class="px-8 text-md bg-primary-600 hover:bg-primary-700 text-white">Submit</Button>
		</div>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 20px auto;
		padding: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}

	.form-group label {
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.form-group input[type='text'],
	.form-group input[type='email'],
	.form-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
	}

	input[type='checkbox'].active-checkbox {
		background-color: #10b981; /* Green background when checked */
	}

	input[type='checkbox'] {
		appearance: none;
		width: 1.25em;
		height: 1.25em;
		border: 2px solid #ccc;
		border-radius: 0.25em;
		display: inline-block;
		position: relative;
		cursor: pointer;
	}

	:global(.dark) input[type='checkbox'] {
		border-color: #4B5563;
	}

	input[type='checkbox'].active-checkbox::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0.75em;
		height: 0.75em;
		background-color: #10b981; /* Green checkmark */
		transform: translate(-50%, -50%) scale(1);
		border-radius: 0.25em;
	}

	@media (max-width: 768px) {
		form {
			padding: 1rem;
		}

		.form-group {
			flex-direction: column;
			align-items: flex-start;
		}

		.form-group input[type='text'],
		.form-group input[type='email'],
		.form-group textarea {
			margin-left: 0;
			margin-top: 0.5rem;
		}
	}
</style>
