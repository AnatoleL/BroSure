import { PDFDocument, PDFPage, PageSizes, createPDFAcroField } from "pdf-lib";

import {program} from "commander"
import fs from "fs/promises";

const loadPdf = async (fileName:string) => {
    const existingBytes = await fs.readFile(fileName);
    const pdfDoc = await PDFDocument.load(existingBytes)
    return pdfDoc;

}

const orderIndexes = (pages: PDFPage[]) : number[] => {
    const orderedIndexes :number[] = [];

    for (let index = 0; index < (pages.length / 2); index++) {
        if (index % 2 === 0)
            orderedIndexes.push(index, pages.length - 1 - index)
        else 
            orderedIndexes.push(pages.length - 1 - index, index)
    }
    return orderedIndexes
}

const reorderPdf = async (pdfDoc: PDFDocument) : Promise<PDFDocument> => {

    const pages = pdfDoc.getPages();



    const newPdfDoc = await PDFDocument.create()

    if (pages.length % 2 !== 0) {
        pdfDoc.insertPage(pages.length - 1)
        console.log("Inserted blank page at the end because of odd number of pages");
    }

    const orderedIndexes = orderIndexes(pages)
    const copiedPages = await newPdfDoc.copyPages(pdfDoc, orderedIndexes)
    const embeddedPages = await newPdfDoc.embedPages(copiedPages)

    for (let i = 0; i < embeddedPages.length; i = i + 2) {
        const newPage = newPdfDoc.addPage([PageSizes.A4[1], PageSizes.A4[0]])

        newPage.drawPage(embeddedPages[i], {
            x: 0,
            y: 0,
        })

        newPage.drawPage(embeddedPages[i + 1], {
            x: embeddedPages[i].width,
            y: 0,
        })
    }

    return newPdfDoc;
}

const savePdfAs = async (pdfDoc: PDFDocument, filename: string) => {

    const newPdfBytes = await pdfDoc.save()

    await fs.writeFile(filename, newPdfBytes);
}


const run = async (args: string[]) => {

    const fileName =  args[0];

    const pdfDoc = await loadPdf(fileName);
    console.log(`Loaded ${fileName}`)

    const orderedPdfDoc = await reorderPdf(pdfDoc);
    console.log(`Reordered pdf`)

    const newFilename = `${fileName}-ordered.pdf`;
    savePdfAs(orderedPdfDoc, newFilename)
    console.log (`PDF Saved as ${newFilename}`)

}

program.parse();

run(program.args);
