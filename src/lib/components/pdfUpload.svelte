<script lang="ts">
	import { Dropzone } from 'flowbite-svelte';
	import { afterUpdate, createEventDispatcher } from 'svelte';
	import { XMark } from 'svelte-heros-v2';
	import { ImgSourceEnum } from '../../models/imgSourceEnum';
	import type { PDFModel } from '../../models/pdfModel';
	import { Shadow } from 'svelte-loading-spinners';
	import { IconFileTypePdf } from '@tabler/icons-svelte';

	export let data: { pdfFiles?: PDFModel[] } = {};
	let pdfFiles: PDFModel[] = data.pdfFiles ?? [];
	let isUploading = false;
	let uploadCount = 0;
	let manuallyCleared = false;  // Flag to track if PDFs were manually cleared

	afterUpdate(() => {
		// Only restore PDFs from data if they haven't been manually deleted
		if (pdfFiles.length === 0 && !manuallyCleared && data.pdfFiles && data.pdfFiles.length > 0) {
			pdfFiles = data.pdfFiles ?? [];
		}
	});
	const dispatch = createEventDispatcher();
	let imageFiles: File[] = [];

	function addImage(e: Event) {
		const fileInput = e.target as HTMLInputElement;
		const totalFiles = fileInput?.files?.length; // Total number of files being uploaded
		for (let file of fileInput!.files!) {
			imageFiles = [...imageFiles, file];

			const reader = new FileReader();
			reader.onloadend = () => {
				let imgSource = ImgSourceEnum.PdfLocal;
				let fileName = file.name;

				pdfFiles = [
					...pdfFiles,
					{
						id: pdfFiles.length,
						imgurl: reader.result as string,
						imgSource: imgSource,
						fileName: fileName
					}
				];

				uploadCount++; // Increment the upload count for each uploaded image

				if (uploadCount === totalFiles) {
					isUploading = false; // Set isUploading to false when all images are uploaded
					uploadCount = 0; // Reset the upload count after all images are uploaded
				}

				//
			};
			reader.readAsDataURL(file);
		}
	}

	function deleteImage(index: number) {
		
		// Store the PDFs before deletion
		const pdfToDelete = pdfFiles[index];
		
		// Filter out the PDF at the specified index
		const updatedImages = pdfFiles.filter((_, i) => i !== index);
		
		// If it's a local PDF file, also update the imageFiles array
		let updatedImageFiles = [...imageFiles];
		if (pdfToDelete.imgSource === ImgSourceEnum.PdfLocal) {
			updatedImageFiles = imageFiles.filter((_, i) => {
				// Find the corresponding index in imageFiles
				const localFileIndex = pdfFiles.findIndex(
					pdf => pdf.imgSource === ImgSourceEnum.PdfLocal && 
					pdf.fileName === imageFiles[i].name
				);
				return localFileIndex !== index;
			});
		}
		
		// Update the state
		pdfFiles = updatedImages;
		imageFiles = updatedImageFiles;
		
		// Mark as manually cleared if all PDFs are now removed
		if (updatedImages.length === 0) {
			manuallyCleared = true;
		}
		
		// Force event dispatch immediately after deletion
		setTimeout(() => runEvent(), 0);
		
	}

	$: {
		if (pdfFiles || imageFiles) {
			runEvent();
		}
	}

	function runEvent() {
		dispatch('imageChanges', pdfFiles);
		dispatch('imageFilesChanges', imageFiles);
	}

	// decode pdf_file
	function decodeBase64(pdf_file: string) {
		const newWindow = window.open();
		if (newWindow !== null) {
			newWindow.document.write(
				'<iframe src="' + pdf_file + '" width="100%" height="100%"></iframe>'
			);
		}
	}

	function openPdfFile(pdf_file: string) {
		const newWindow = window.open();
		if (newWindow !== null) {
			newWindow.document.write(
				'<iframe src="' +
					`${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_PDF_URL}/${pdf_file}` +
					'" width="100%" height="100%"></iframe>'
			);
		}
	}
</script>

<div class="px-8">
	<Dropzone
		multiple
		id="dropzone"
		type="file"
		accept=".pdf"
		on:change={addImage}
		class="h-32 cursor-auto"
	>
		{#if isUploading}
			<!-- Show the loading spinner while uploading images -->
			<Shadow size="50" color="#FF3E00" unit="px" duration="1s" />
		{:else}
			<span class="bg-primary-dark p-3 rounded-3xl font-semibold text-white cursor-pointer"
				>Upload PDF File</span
			>
		{/if}
	</Dropzone>
	<div class="pt-5" />
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
		{#each pdfFiles as image, index}
			<div
				class="w-full h-32 border bg-[#f1f3f4] mx-2 rounded-lg relative flex flex-col justify-normal items-center"
			>
				<button
					class="bg-red-700 absolute -top-2 -right-2 rounded-full border-2"
					on:click={(event) => {
						event.stopPropagation();
						deleteImage(index);
					}}
				>
					<XMark class="text-xs h-5 w-5 text-white" />
				</button>

				<button
					on:click={() =>
						image.imgSource == ImgSourceEnum.PdfLocal
							? decodeBase64(image.imgurl)
							: openPdfFile(image.imgurl)}
					class="cursor-pointer"
				>
					<span class="p-2">
						<IconFileTypePdf size={64} color="#B12A27" />
					</span>

					<span class="border">
						PDF File
					</span>
				</button>
			</div>
		{/each}
	</div>
</div>