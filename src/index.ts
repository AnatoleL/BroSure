console.log("HELLO")
import  reorderPdfFromPath  from "./reorderPdf"
import {PDFDocument} from "pdf-lib"


const addEventListenerToSubmitButton = () => {
    const submitButtonElement = document.querySelector("#submit-button");

    submitButtonElement?.addEventListener('click', async (event)=> {
        event.preventDefault();
        const inputElement = document.getElementById("pdf-file-input") as HTMLInputElement
        if (!inputElement || !inputElement.files) {
            return
        }
        const newPDFDBytes = await reorderPdfFromPath(inputElement.files[0])

        var blob=new Blob([newPDFDBytes], {type: "application/pdf"});// change resultByte to bytes
        
        var link=document.createElement('a');
        link.href=window.URL.createObjectURL(blob);
        link.download="myFileName.pdf";
        link.click();
    })

}

const preventFormDefault = () => {
    const formElement = document.querySelector("form");
    formElement?.addEventListener("submit", e => e.preventDefault())
}

const init = () => {
    preventFormDefault();
    addEventListenerToSubmitButton()
}

init();


// document.addEventListener('submit', function (event) {
//     if (!event || !event.target || !event.target.type) {
//         return
//     }

//     if  (event.target.type !== "submit") {
//         return
//     }
// 	// If the clicked element doesn't have the right selector, bail
//     console.dir(event.target)

// 	// Don't follow the link
// 	event.preventDefault();

// 	// Log the clicked element in the console
// 	console.log(event.target);

// }, false);