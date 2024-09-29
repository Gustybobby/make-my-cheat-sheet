import { PageSizes, PDFDocument } from "pdf-lib";

export async function createCheatsheet(
  pdfFile: File,
  width: number,
  height: number,
  removePages: number[],
): Promise<PDFDocument | null> {
  const buffer = await pdfFile.arrayBuffer();
  const pdfRef = await PDFDocument.load(buffer);
  const refCount = pdfRef.getPageCount() - removePages.length;

  if (refCount === 0) {
    return null;
  }
  const pdfDoc = await PDFDocument.create();

  const embedPages = await pdfDoc.embedPdf(
    pdfRef,
    Array.from(Array(refCount + removePages.length).keys()).filter(
      (num) => !removePages.includes(num + 1),
    ),
  );

  const pageCount = Math.ceil(refCount / (width * height));

  let currRefPage = 0;

  for (let i = 0; i < pageCount; i++) {
    const page = pdfDoc.addPage(PageSizes.A4);
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const slotWidth = page.getWidth() / width;
        const slotHeight = page.getHeight() / height;
        page.drawPage(embedPages[currRefPage], {
          x: slotWidth * w,
          y: page.getHeight() - slotHeight * (h + 1),
          width: slotWidth,
          height: slotHeight,
        });
        currRefPage++;
        if (currRefPage >= refCount) {
          return pdfDoc;
        }
      }
    }
  }

  return pdfDoc;
}
