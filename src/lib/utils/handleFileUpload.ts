import imageCompression from 'browser-image-compression';
import { getRandomTextNumber } from './generateRandomNumber';

export async function handleFileUpload(
	e: Event,
	exhibitionsObject: any,
	setImageFile: Function,
	setFileName: Function,
	path: string
) {
	const fileInput = e.target as HTMLInputElement;
	const file = fileInput.files![0];

	const options = {
		maxSizeMB: 2,
		maxWidthOrHeight: 700,
		useWebWorker: true
	};
	try {
		const compressedFile = await imageCompression(file, options);

		const reader = new FileReader();
		reader.onloadend = () => {
			exhibitionsObject.thumbnail = reader.result as string;
			const randomText = getRandomTextNumber();
			const newFileName = `${path}/${randomText}`;
			setImageFile(compressedFile);
			setFileName(newFileName);
		};
		reader.readAsDataURL(compressedFile);
	} catch (error) {}
}
