<script lang="ts">
	import { Button, Tabs, TabItem, Textarea, Fileupload } from 'flowbite-svelte';
	import { getData } from '../../../../../stores/exhibitionStore';
	import { addNewToast } from '../../../../../stores/toastStore';
	import { ToastTypeEnum } from '../../../../../models/toastTypeEnum';
	import { onMount } from 'svelte';
	import { getRandomTextNumber } from '$lib/utils/generateRandomNumber';
	import { page } from '$app/stores';
	import UploadContractFile from '../../reservation_by_area/uploadContractFile.svelte';
	import RequiredFieldsComponent from '../../reservation_by_area/requiredFields.svelte';

	export let data: any;
	let imageFile: File | undefined;
	let fileName: string;
	let loading = false;
	let formSubmitted = false;
	let seatData: any = { excel_preview_url: '' };
	let exhibitionId: number;

	const pageId = $page.params.seatId;

	onMount(async () => {
		await getData(data.supabase);
		await getSeatData();
	});

	// get seta data by depend Id (return exhibition id )
	// Fetching seat data
	async function getSeatData() {
		const response = await data.supabase.from('seat_layout').select('*').eq('id', pageId);
		if (response.data && response.data.length > 0) {
			exhibitionId = response.data[0].exhibition;
		} else {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'No data found for this seat',
				title: 'Failed',
				duration: 1000
			});
		}
	}

	// For uploading image
	function handleFileUpload(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		if (fileInput.files && fileInput.files[0]) {
			imageFile = fileInput.files[0];

			const randomText = getRandomTextNumber();
			fileName = `seat_layout/${randomText}`;
		}
	}

	async function updateSeat() {
		formSubmitted = true;
		loading = true;

		try {
			if (seatData.excel_preview_url) {
				// Remove the existing file
				await data.supabase.storage.from('image').remove([seatData.excel_preview_url]);
			}

			// Upload the new file
			if (imageFile) {
				const response = await data.supabase.storage.from('image').upload(fileName, imageFile);
				seatData.excel_preview_url = response?.data?.path;
			}

			// Update the database record
			await data.supabase
				.from('seat_layout')
				.update({ excel_preview_url: seatData.excel_preview_url })
				.eq('id', pageId);

			addNewToast({
				type: ToastTypeEnum.SUCCESS,
				message: 'The Seat Added Successfully',
				title: 'Success',
				duration: 1000
			});
		} catch (error) {
			addNewToast({
				type: ToastTypeEnum.ERROR,
				message: 'Failed To Update this seat',
				title: 'Failed',
				duration: 1000
			});
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-full h-full flex flex-col justify-center items-center">
	<div class="bg-[#f9fafb] w-7/12 p-14 rounded-lg">
		<Tabs>
			<TabItem title="add Seat Area fields" open>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-2 p-6">
					<div class="col-span-3 my-4">
						<div class="max-w-[400px]">
							<p>upload image for sheet preview</p>
							<Fileupload
								accept=".jpg, .jpeg, .png"
								class=" dark:bg-white"
								on:change={(event) => handleFileUpload(event)}
							/>
						</div>
					</div>
				</div>

				<div class="flex justify-end mt-10">
					<Button type="submit" on:click={updateSeat}>Submit</Button>
				</div>
			</TabItem>
			<TabItem title="add Company Info Required Data">
				<RequiredFieldsComponent {exhibitionId} supabase={data.supabase} detail={true} />
			</TabItem>
			<TabItem title="upload contract file">
				<UploadContractFile {exhibitionId} supabase={data.supabase} />
			</TabItem>
		</Tabs>
	</div>
</div>
