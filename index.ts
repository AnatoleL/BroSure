import { PDFDocument } from "pdf-lib";

import {program} from "commander"
import fs from "fs/promises";

const loadPdf = async (fileName:string) => {
    const existingBytes = await fs.readFile(fileName);
    const pdfDoc = await PDFDocument.load(existingBytes)
    return pdfDoc;

}

const reorderPdf = (pdfDoc: PDFDocument) : PDFDocument => {

    const pages = pdfDoc.getPages();
    pdfDoc.insertPage(0, pages[0]);

    return pdfDoc;
}

const savePdfAs = async (pdfDoc: PDFDocument, filename: string) => {

    const newPdfBytes = await pdfDoc.save()

    await fs.writeFile(filename, newPdfBytes);
}


const run = async (args: string[]) => {

    const fileName =  args[0];

    const pdfDoc = await loadPdf(fileName);
    console.log(`Loaded ${fileName}`)

    const orderedPdfDoc = reorderPdf(pdfDoc);
    console.log(`Reordered pdf`)

    const newFilename = `${fileName}-ordered.pdf`;
    savePdfAs(pdfDoc, newFilename)
    console.log (`PDF Saved as ${newFilename}`)

}

program.parse();

run(program.args);
