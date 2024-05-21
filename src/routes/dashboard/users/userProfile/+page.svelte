<script lang="ts">
	import { TabItem, Tabs } from 'flowbite-svelte';
	import { goto } from '$app/navigation';

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
		hotelBooking: false
	};

	const fetchUserProfile = async () => {
		const { data: userProfileData, error } = await data.supabase
			.from('userProfile')
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
				.from('userProfile')
				.update(dataToSubmit)
				.eq('id', userProfile.id);
		} else {
			response = await data.supabase.from('userProfile').insert([dataToSubmit]);
		}

		if (response.error) {
			console.error('Error submitting data:', response.error);
		} else {
			alert('Data submitted successfully!');
			goto(`/dashboard/users`);
		}
	};

	fetchUserProfile();
</script>

<form on:submit|preventDefault={handleSubmit} class="border dark:border-gray-700 rounded">
	<div class="container mx-auto p-4">
		<Tabs>
			<TabItem title="EN" open>
				<form
					on:submit|preventDefault={handleSubmit}
					class="border dark:border-gray-700 rounded p-4"
				>
					<p class="text-center py-2 font-semibold">Add form data for EN language</p>
					<div class="form-group">
						<label for="title-en">Title</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="title-en"
							type="text"
							bind:value={userProfile.title.en}
							placeholder="Enter title in English"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-en">Email Subject</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="email-subject-en"
							type="text"
							bind:value={userProfile.emailSubject.en}
							placeholder="Enter email subject in English"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-en">Email Description</label>
						<textarea
							class="rounded dark:text-gray-900 w-full"
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
					class="border dark:border-gray-700 rounded p-4"
				>
					<p class="text-center py-2 font-semibold">Add data for AR language</p>
					<div class="form-group">
						<label for="title-ar">Title</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="title-ar"
							type="text"
							bind:value={userProfile.title.ar}
							placeholder="Enter title in Arabic"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-ar">Email Subject</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="email-subject-ar"
							type="text"
							bind:value={userProfile.emailSubject.ar}
							placeholder="Enter email subject in Arabic"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-ar">Email Description</label>
						<textarea
							class="rounded dark:text-gray-900 w-full"
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
					class="border dark:border-gray-700 rounded p-4"
				>
					<p class="text-center py-2 font-semibold">Add data for CKB language</p>
					<div class="form-group">
						<label for="title-ckb">Title</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="title-ckb"
							type="text"
							bind:value={userProfile.title.ckb}
							placeholder="Enter title in Kurdish"
						/>
					</div>
					<div class="form-group">
						<label for="email-subject-ckb">Email Subject</label>
						<input
							class="rounded dark:text-gray-900 w-full"
							id="email-subject-ckb"
							type="text"
							bind:value={userProfile.emailSubject.ckb}
							placeholder="Enter email subject in Kurdish"
						/>
					</div>
					<div class="form-group">
						<label for="email-description-ckb">Email Description</label>
						<textarea
							class="rounded dark:text-gray-900 w-full"
							id="email-description-ckb"
							bind:value={userProfile.emailDescription.ckb}
							placeholder="Enter email description in Kurdish"
						/>
					</div>
				</form>
			</TabItem>
		</Tabs>
	</div>

	<p class="text-center font-semibold">Required fields to user profiles</p>
	{#each Object.keys(includeFields) as key}
		<div class="form-group">
			<label>
				<input
					class:active-checkbox={includeFields[key]}
					class="mr-3"
					type="checkbox"
					checked={includeFields[key]}
					on:change={(e) => (includeFields[key] = e.target?.checked)}
				/>
				{key.charAt(0).toUpperCase() + key.slice(1)}
			</label>
		</div>
	{/each}
	<button type="submit">Submit</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 600px;
		margin: 10px auto;
		padding: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.form-group label {
		margin-bottom: 0.5rem;
	}

	.form-group input[type='text'],
	.form-group input[type='email'],
	.form-group textarea {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	button {
		align-self: flex-end;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background-color: #e9ecefd2;
		color: black;
		cursor: pointer;
		transition: background-color 0.3s;
	}

	button:hover {
		background-color: #d2d6dbd2;
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

	@media (max-width: 600px) {
		form {
			padding: 0.5rem;
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
