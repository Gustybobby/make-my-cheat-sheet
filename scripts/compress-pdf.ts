import { PageSizes, PDFDocument } from "pdf-lib";

export async function createCheatsheet(
  pdfFiles: File[],
  width: number,
  height: number,
  modPages: number[][],
  modRemoves: boolean[],
): Promise<PDFDocument | null> {
  const pdfRef = await mergePDFFiles(pdfFiles, modPages, modRemoves);
  const refCount = pdfRef.getPageCount();

  if (refCount === 0) {
    return null;
  }
  const pdfDoc = await PDFDocument.create();

  const embedPages = await pdfDoc.embedPdf(
    pdfRef,
    Array.from(Array(refCount).keys()),
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

async function mergePDFFiles(
  files: File[],
  modPages: number[][],
  modRemoves: boolean[],
) {
  const mergedPdf = await PDFDocument.create();

  let i = 0;
  for (const file of files) {
    const document = await PDFDocument.load(await file.arrayBuffer());

    const copiedPages = await mergedPdf.copyPages(
      document,
      document.getPageIndices(),
    );
    copiedPages.forEach((page, idx) => {
      if (
        (modPages[i].includes(idx + 1) && modRemoves[i]) ||
        (!modPages[i].includes(idx + 1) && !modRemoves[i])
      ) {
        return;
      }
      mergedPdf.addPage(page);
    });
    i++;
  }

  return mergedPdf;
}
