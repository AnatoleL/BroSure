import { PDFDocument, PDFPage, PageSizes, TransformationMatrix, concatTransformationMatrix, createPDFAcroField } from "pdf-lib";

import fs from "fs/promises";

/**
 * Loads a PDF file into memory.
 * 
 * @param filename Path to PDF file
 */
export const loadPdf = async (fileName:string) => {
    const existingBytes = await fs.readFile(fileName);
    const pdfDoc = await PDFDocument.load(existingBytes)

    return pdfDoc;
}

/**
 * Returns the array of `pages` indexes so that the pages are in a printable booklet ordering.
 * Example: for 6 pages, returns [5, 0, 1, 4, 3, 2]
 * 
 * @param pages 
 * @returns 
 */
const orderIndexes = (numberOfPages: number) : number[] => {
    const orderedIndexes :number[] = [];

    for (let index = 0; index < (numberOfPages / 2); index++) { 
        if (index % 2 === 0) {

            orderedIndexes.push(numberOfPages - 1 - index, index);
        }
        else  {
            orderedIndexes.push(index, numberOfPages - 1 - index);
        }
    }
    return orderedIndexes
}

/**
 * Reorders and resizes the pages of the given PDF document to booklet format
 */
const reorderAndResizePages = async (pdfDoc: PDFDocument) : Promise<PDFDocument> => {

    const srcPdfSize = pdfDoc.getPageCount();
    const newPdfDoc = await PDFDocument.create()

    const orderedIndexes = orderIndexes(srcPdfSize)
    const copiedPagesInOrder = await newPdfDoc.copyPages(pdfDoc, orderedIndexes)


    const transformationMatrices: TransformationMatrix[] = [];
    for (const copiedPage of copiedPagesInOrder) {
        transformationMatrices.push([PageSizes.A5[0] / copiedPage.getWidth(), 0, 0, PageSizes.A5[1]/copiedPage.getHeight(), 0, 0])
    }

    const embeddedPages = await newPdfDoc.embedPages(copiedPagesInOrder, undefined, transformationMatrices) // embedded pages are needed to merge two vertical pages into one horizontal one

    // For every couple of pages two merge, we create a new horizontal A4 page and put one on the left and one on the right.
    for (let i = 0; i < embeddedPages.length; i = i + 2) {
        const newPage = newPdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]])

        // compensating for odd number of pages
        if ((srcPdfSize % 2 === 0 ) || (i !== 0)) {
            newPage.drawPage(embeddedPages[i], {
                x: 0,
                y: 0,
            })
        }

        newPage.drawPage(embeddedPages[i + 1], {
            x: PageSizes.A5[0],
            y: 0,
        })
    }

    return newPdfDoc;
}

const savePdfAs = async (pdfDoc: PDFDocument, filename: string) => {

    const newPdfBytes = await pdfDoc.save()

    await fs.writeFile(filename, newPdfBytes);
}


export const reorderPdfFromPath = async (filename: string): Promise<string> =>  {

    const pdfDoc = await loadPdf(filename);
    console.log(`Loaded ${filename}`)


    const orderedPdfDoc = await reorderAndResizePages(pdfDoc);
    console.log(`Reordered pdf`)

    const newFilename = `${filename}-ordered.pdf`;
    await savePdfAs(orderedPdfDoc, newFilename)
    console.log (`PDF Saved as ${newFilename}`)

    return newFilename
}