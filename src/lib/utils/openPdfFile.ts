export function openPdfFile(pdfLink: string) {

	const completePdfLink = `${import.meta.env.VITE_PUBLIC_SUPABASE_STORAGE_PDF_URL}/${pdfLink}`;

	const newWindow = window.open();
	if (newWindow !== null) {
		newWindow.document.body.innerHTML = `<iframe src="${completePdfLink}" width="100%" height="100%"></iframe>`;

	}
}
