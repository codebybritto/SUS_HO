import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  orientation?: 'portrait' | 'landscape';
}

/**
 * Robustly renders an HTML document string to a downloadable A4 PDF using jsPDF + html2canvas.
 * Uses an off-screen iframe to guarantee full CSS parsing, styles, images, and fonts without blank pages.
 */
export async function exportHtmlToPdf(
  htmlContent: string,
  filename: string,
  options?: PdfExportOptions
): Promise<void> {
  // Determine orientation: explicit option or detected from HTML
  const isLandscape =
    options?.orientation === 'landscape' ||
    (!options?.orientation && (htmlContent.includes('size: A4 landscape') || htmlContent.includes('landscape')));

  // Standard A4 dimensions at 96 DPI
  // Portrait: 794px x 1123px (210mm x 297mm)
  // Landscape: 1123px x 794px (297mm x 210mm)
  const iframeWidth = isLandscape ? 1123 : 794;
  const iframeMinHeight = isLandscape ? 794 : 1123;

  // 1. Create a hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = `${iframeWidth}px`;
  iframe.style.height = `${iframeMinHeight}px`;
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
      iframeMinHeight
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
      windowWidth: iframeWidth,
      windowHeight: contentFullHeight,
      height: contentFullHeight,
    });

    // 5. Build PDF with jsPDF
    const pdf = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfPageWidth = isLandscape ? 297 : 210;
    const pdfPageHeight = isLandscape ? 210 : 297;
    const margin = 8; // 8mm margin
    const printableWidth = pdfPageWidth - margin * 2;
    const printableHeight = pdfPageHeight - margin * 2;

    // Slicing canvas per page for crystal clear pagination without clipping
    const pageCanvasHeight = Math.floor((printableHeight * canvas.width) / printableWidth);

    // Avoid generating an accidental blank page when canvas.height exceeds by just a few trailing pixels (e.g. margin/padding)
    const basePages = Math.floor(canvas.height / pageCanvasHeight);
    const trailingPixels = canvas.height - basePages * pageCanvasHeight;
    // Only add a new page if the overflow has substantial content (> 80px)
    const totalPages = Math.max(1, trailingPixels > 80 ? basePages + 1 : basePages);

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      const sY = i * pageCanvasHeight;
      // On the last page, capture all remaining content cleanly
      const sHeight = i === totalPages - 1
        ? Math.min(pageCanvasHeight, canvas.height - sY)
        : pageCanvasHeight;

      // Create high-res canvas slice for this page
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.max(sHeight, 1);
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sY,
          canvas.width,
          sHeight,
          0,
          0,
          canvas.width,
          sHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.98);
      const renderHeight = (sHeight * printableWidth) / canvas.width;
      pdf.addImage(pageImgData, 'JPEG', margin, margin, printableWidth, renderHeight);
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
