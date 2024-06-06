import * as XLSX from 'xlsx';

export function exportToExcel(data: any, filename = 'data.xlsx') {
	// Create a worksheet from the data
	const worksheet = XLSX.utils.json_to_sheet(data);

	// Create a new workbook and append the worksheet
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

	// Generate a buffer and trigger the download
	const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
	const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

	// Create a link element and trigger the download
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
