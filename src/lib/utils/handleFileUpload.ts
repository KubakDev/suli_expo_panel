import { getRandomTextNumber } from './generateRandomNumber';

//**for upload exhibition image**//
export function handleFileUpload(e: Event, exhibitionsData: any, imageFile: any, fileName: any) {
	const fileInput = e.target as HTMLInputElement;
	const file = fileInput.files![0];
	imageFile = file;
	const reader = new FileReader();

	reader.onloadend = () => {
		exhibitionsData.thumbnail = reader.result as '';
		const randomText = getRandomTextNumber(); // Generate random text
		fileName = `exhibition/${randomText}_${file.name}`;
	};
	reader.readAsDataURL(file);
} //**for upload exhibition image**//
