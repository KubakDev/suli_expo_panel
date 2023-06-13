export const canvasToDataUrl = (canvas: any) => {
	let dataURL = canvas.toDataURL({
		format: 'png',
		quality: 1
	});

	return dataURL;
};

export const dataUrlToBlob = (dataUrl: string) => {
	var arr = dataUrl.split(','),
		mime = arr[0].match(/:(.*?);/)![1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};

export const blobToFile = (theBlob: any, fileName: string) => {
	theBlob.lastModifiedDate = new Date();
	theBlob.name = fileName;
	return theBlob;
};

export function canvasToFile(canvas: any, fileName: string) {
	const dataUrl = canvasToDataUrl(canvas);
	const blob = dataUrlToBlob(dataUrl);
	const file = blobToFile(blob, fileName);
	return file;
}
