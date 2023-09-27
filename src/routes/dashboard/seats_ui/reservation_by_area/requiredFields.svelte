<script lang="ts">
	import type { SupabaseClient } from '@supabase/supabase-js';
	import { Checkbox, Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { addNewToast } from '../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../models/toastTypeEnum';

	export let exhibitionId: number | null | undefined;
	export let supabase: SupabaseClient;
	export let detail: boolean | null | undefined = null;

	let allCompanyInfoFields: {
		name: string;
		status: boolean;
	}[] = [
		{
			name: 'company_name',
			status: false
		},
		{
			name: 'phone_number',
			status: false
		},
		{
			name: 'logo_url',
			status: false
		},
		{
			name: 'email',
			status: false
		},
		{
			name: 'working_field',
			status: false
		},
		{
			name: 'manager_name',
			status: false
		},
		{
			name: 'passport_number',
			status: false
		},
		{
			name: 'address',
			status: false
		}
	];

	onMount(() => {
		if (detail) {
			getRequiredFiledData();
		}
	});
	async function getRequiredFiledData() {
		await supabase
			.from('required_company_fields_exhibition')
			.select('*')
			.eq('exhibition_id', exhibitionId)
			.single()
			.then((response) => {
				if (response.data) {
					let requiredFields = response.data.fields;
					allCompanyInfoFields.forEach((field) => {
						if (requiredFields.includes(field.name)) {
							field.status = true;
						}
					});
					allCompanyInfoFields = [...allCompanyInfoFields];
				}
			});
	}
	async function addRequiredFields() {
		let requiredFields: string[] = [];
		allCompanyInfoFields.forEach((field) => {
			if (field.status) {
				requiredFields.push(field.name);
			}
		});
		await supabase
			.from('required_company_fields_exhibition')
			.delete()
			.eq('exhibition_id', exhibitionId);
		const response = await supabase.from('required_company_fields_exhibition').insert({
			exhibition_id: exhibitionId,
			fields: `{${requiredFields.join(',')}}`
		});
		if (!response.error) {
			addNewToast({
				type: ToastTypeEnum.SUCCESS,
				message: 'required fields added successfully',
				title: 'Success',
				duration: 1000
			});
		}
	}
</script>

<div class="p-10">
	{#if !exhibitionId}
		<div class="mb-10 w-full">
			<div
				class="bg-[#cf240d8c] rounded-lg flex items-center w-full p-4 text-gray-500 bg-white shadow dark:text-gray-400 dark:bg-gray-800"
			>
				<div class="pl-4 text-sm font-normal text-white">
					you have to select an exhibition from previous tab!
				</div>
			</div>
		</div>
	{/if}
	{#each allCompanyInfoFields as field}
		<div class="my-3">
			<Checkbox
				disabled={!exhibitionId}
				checked={field.status}
				on:click={() => {
					field.status = !field.status;
				}}>{field.name}</Checkbox
			>
		</div>
	{/each}
	<div class="mt-6 flex justify-end">
		<Button on:click={addRequiredFields}>Submit</Button>
	</div>
</div>
