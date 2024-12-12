import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generatePdf = async (elementId) => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  pdf.addImage(imgData, "PNG", 10, 10);
  pdf.save("report.pdf");
};
