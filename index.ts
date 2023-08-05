import { PDFDocument, PDFPage, createPDFAcroField } from "pdf-lib";

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
        orderedIndexes.push(index, pages.length - 1 - index)
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
    for (const copiedPage of copiedPages) {
        newPdfDoc.addPage(copiedPage)
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
