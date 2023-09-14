
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export const generateDocx = (decodedFile: string, data: any) => {
  const templateBase64 = decodedFile;
  const templateContent = atob(templateBase64);
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater().loadZip(zip);

  doc.setData(data);

  try {
    doc.render();
  } catch (error) {
    console.error(error);
  }
  const generatedDocx = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(generatedDocx);
  downloadLink.download = 'generated.docx';
  downloadLink.click();
};