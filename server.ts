import express, { Request, Response } from 'express';
import multer from "multer";
import { reorderPdfFromPath } from './reorderPdf'; 
import fs from "fs"

export const app = express();

const upload = multer({ dest: 'uploads/' })

// Allows cross origin requests
import cors from 'cors';
app.use(cors({ origin: true }));


app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.status(200).sendFile("index.html", {root: "./public"});
})

app.post('/', upload.single('pdf-file'), async (request, response)=> {
    if (!request.file) {
        return response.status(400).send();
    }

    const uploadedFilePath = request.file.path

    const reorderedPdfFilePath = await reorderPdfFromPath(request.file.path);
    response.status(200).sendFile(reorderedPdfFilePath, {root: "."})

    fs.rm(reorderedPdfFilePath, () => {});
    fs.rm(uploadedFilePath, () => {});
    console.log("Removed ", reorderedPdfFilePath)
    console.log("Removed ", uploadedFilePath)

})

app.listen(8888)