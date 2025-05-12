<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Input, Label, Select } from 'flowbite-svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import { THEME_COLORS } from '$lib/utils/themeColors';
	
	interface User {
		id: number;
		created_at: string;
		name: string;
		companyName: string;
		fieldWork: string;
		jobGrade: string;
		phoneNumber: string;
		email: string;
		country: string;
		city: string;
		referrer_name: string;
		hotelBooking: string;
	}

	const id = $page.params.userId;
	export let data;
	let loaded = false;
	let user: User = {
		id: 0,
		created_at: '',
		name: '',
		companyName: '',
		fieldWork: '',
		jobGrade: '',
		phoneNumber: '',
		email: '',
		country: '',
		city: '',
		referrer_name: '',
		hotelBooking: ''
	};

	onMount(async () => {
		loaded = false;	
		const { data: result, error } = await data.supabase.rpc(
			'get_user_data_by_id_to_game_exhibition_form',
			{
				userid: id
			}
		);

		if (error) {
			console.error(error);
			return;
		}

		user = result;
		loaded = true;
	});

	async function formSubmit() {
		try {
			const { error } = await data.supabase
				.from('gameExhibitionForm')
				.update({
					name: user.name,
					companyName: user.companyName,
					fieldWork: user.fieldWork,
					jobGrade: user.jobGrade,
					phoneNumber: user.phoneNumber,
					email: user.email,
					country: user.country,
					city: user.city,
					referrer_name: user.referrer_name,
					hotelBooking: user.hotelBooking
				})
				.eq('id', id);

			if (error) {
				console.error(error);
				return;
			}

			goto('/dashboard/usersGameExhibition');
		} catch (error) {
			console.error('An unexpected error occurred:', error);
		}
	}
</script>
{#if !loaded}
<div class="flex justify-center items-center h-screen">
	<Spinner size="h-16 w-16" color="border-gray-500" />
</div>
{:else}
<div style="min-height: calc(100vh - 160px);">
	<div class="max-w-screen-2xl mx-auto py-10">
		<div class="border dark:border-gray-700 p-4 rounded-lg shadow-lg bg-white dark:bg-[{THEME_COLORS.DARK.BACKGROUND}]">
			<div class="flex justify-center py-10">
				<h1 class="text-2xl font-bold text-gray-600 dark:text-gray-300">Update User Data</h1>
			</div>

			<div class="grid lg:grid-cols-3 gap-4 px-4">
				<div class="col-span-1">
					<Label for="name" class="mb-2 text-gray-700 dark:text-gray-300">FullName</Label>
					<Input
						type="text"
						placeholder="Enter full name"
						id="name"
						name="name"
						bind:value={user.name}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="companyName" class="mb-2 text-gray-700 dark:text-gray-300">Company Name</Label>
					<Input
						type="text"
						placeholder="Enter company name"
						id="companyName"
						name="companyName"
						bind:value={user.companyName}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="jobGrade" class="mb-2 text-gray-700 dark:text-gray-300">Job Grade</Label>
					<Input
						type="text"
						placeholder="Enter job grade"
						id="jobGrade"
						name="jobGrade"
						bind:value={user.jobGrade}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="fieldWork" class="mb-2 text-gray-700 dark:text-gray-300">Field Work</Label>
					<Input
						type="text"
						placeholder="Enter field Work"
						id="fieldWork"
						name="fieldWork"
						bind:value={user.fieldWork}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="phoneNumber" class="mb-2 text-gray-700 dark:text-gray-300">Phone Number</Label>
					<Input
						type="text"
						placeholder="Enter phone number"
						id="phoneNumber"
						name="phoneNumber"
						bind:value={user.phoneNumber}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="email" class="mb-2 text-gray-700 dark:text-gray-300">Email</Label>
					<Input
						type="text"
						placeholder="Enter email"
						id="email"
						name="email"
						bind:value={user.email}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="country" class="mb-2 text-gray-700 dark:text-gray-300">Country</Label>
					<Input
						type="text"
						placeholder="Enter country"
						id="country"
						name="country"
						bind:value={user.country}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="city" class="mb-2 text-gray-700 dark:text-gray-300">City</Label>
					<Input
						type="text"
						placeholder="Enter city"
						id="city"
						name="city"
						bind:value={user.city}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="referrer_name" class="mb-2 text-gray-700 dark:text-gray-300">Referrer Name</Label>
					<Input
						type="text"
						placeholder="Enter referrer_name"
						id="referrer_name"
						name="referrer_name"
						bind:value={user.referrer_name}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					/>
				</div>
				<div class="col-span-1">
					<Label for="hotelBooking" class="mb-2 text-gray-700 dark:text-gray-300">Hotel Booking</Label>
					<Select 
						bind:value={user.hotelBooking}
						class="bg-white dark:bg-[{THEME_COLORS.DARK.TABLE_CELL}] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
					>
						<option value="Yes">Yes</option>
						<option value="No">No</option>
					</Select>
				</div>
			</div>
			<div class="my-10 mx-4 flex justify-end">
				<button
					on:click|preventDefault={formSubmit}
					type="submit"
					class="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 border border-primary-600"
				>
					Update
				</button>
			</div>
		</div>
	</div>
</div>
{/if}
