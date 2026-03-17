
const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/create", upload.array("bilder"), (req, res) => {

const template = path.join(__dirname,"template","schadenerfassung.docx")
const content = fs.readFileSync(template,"binary")

const zip = new PizZip(content)
const doc = new Docxtemplater(zip)

doc.setData({
vertrag:req.body.vertrag,
datum:req.body.retour,
artikel:req.body.artikel,
vermieter:req.body.vermieter,
schaden:req.body.schaden,
kosten:req.body.kosten,
mitarbeiter:req.body.mitarbeiter
})

try{
doc.render()
}catch(e){
console.log(e)
return res.status(500).send("Template Fehler")
}

const docxPath = path.join(__dirname,"temp.docx")
const pdfPath = path.join(__dirname,"temp.pdf")

const buffer = doc.getZip().generate({type:"nodebuffer"})
fs.writeFileSync(docxPath,buffer)

execSync(`libreoffice --headless --convert-to pdf "${docxPath}" --outdir "${__dirname}"`)

if(!fs.existsSync(pdfPath)){
return res.status(500).send("PDF konnte nicht erstellt werden")
}

res.download(pdfPath,"Schadenerfassung_"+req.body.vertrag+".pdf")

})

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
console.log("Server läuft auf Port "+PORT)
})
