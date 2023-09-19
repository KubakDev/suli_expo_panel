 export function decodeBase64(pdf_file: any) {
		const newWindow = window.open();
		if (newWindow !== null) {
			newWindow.document.write(
				'<iframe src="' + pdf_file + '" width="100%" height="100%"></iframe>'
			);
		}
	
	}


 