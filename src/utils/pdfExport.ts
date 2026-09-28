import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Robustly renders an HTML document string to a downloadable A4 PDF using jsPDF + html2canvas.
 * Uses an off-screen iframe to guarantee full CSS parsing, styles, images, and fonts without blank pages.
 */
export async function exportHtmlToPdf(htmlContent: string, filename: string): Promise<void> {
  // 1. Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '794px'; // 210mm at 96 DPI
  iframe.style.height = '1123px'; // 297mm at 96 DPI
  iframe.style.zIndex = '-9999';
  iframe.style.opacity = '0.01'; // Small opacity so browser renders layout & styles
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentWindow?.document;
    if (!doc) throw new Error('Não foi possível inicializar o documento para impressão');

    // 2. Write full HTML content (including head styles and body)
    doc.open();
    doc.write(htmlContent);
    doc.close();

    // 3. Wait for layout, styles and fonts to settle
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Wait for images (like the shield logo) to complete loading
    const images = Array.from(doc.images);
    if (images.length > 0) {
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalHeight !== 0) {
                resolve();
              } else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            })
        )
      );
    }

    // Small delay after images load to ensure full rasterization
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Expand iframe to full content height to avoid any clipping
    const contentFullHeight = Math.max(
      doc.body.scrollHeight,
      doc.body.offsetHeight,
      doc.documentElement.scrollHeight,
      1123
    );
    iframe.style.height = `${contentFullHeight}px`;

    // 4. Capture rendered body with html2canvas
    const bodyElement = doc.body;
    const canvas = await html2canvas(bodyElement, {
      scale: 2, // High resolution (300 DPI equivalent)
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794,
      windowHeight: contentFullHeight,
      height: contentFullHeight,
    });

    // 5. Build PDF with jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = 210;
    const pdfPageHeight = 297;
    const margin = 6; // 6mm margin
    const printableWidth = pdfPageWidth - margin * 2; // 198mm
    const printableHeight = pdfPageHeight - margin * 2; // 285mm
    const contentHeight = (canvas.height * printableWidth) / canvas.width;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // Multi-page pagination
    const pageCount = Math.max(1, Math.ceil(contentHeight / printableHeight));

    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const position = margin - i * printableHeight;
      pdf.addImage(imgData, 'JPEG', margin, position, printableWidth, contentHeight);
    }

    // 6. Save PDF directly to user's device
    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    // 7. Clean up iframe
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }
}
