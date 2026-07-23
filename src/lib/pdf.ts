"use client";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePdfFromElement(elementId: string, filename: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    alert("Invoice template element not found!");
    window.print();
    return;
  }

  try {
    // Clone or temporary style fix for canvas rendering
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        const clonedElem = clonedDoc.getElementById(elementId);
        if (clonedElem) {
          clonedElem.style.display = "block";
          clonedElem.style.position = "static";
          clonedElem.style.left = "0";
          clonedElem.style.visibility = "visible";
        }
      }
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename);
  } catch (error) {
    console.error("Failed to generate PDF via canvas:", error);
    // Reliable Fallback to Browser Native PDF Print
    window.print();
  }
}
