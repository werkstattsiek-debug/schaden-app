const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const libre = require("libreoffice-convert");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/create", upload.none(), async (req, res) => {

try {

const templatePath = path.join(__dirname, "template", "schadenerfassung.docx");

const content = fs.readFileSync(templatePath, "binary");

const zip = new PizZip(content);

const doc = new Docxtemplater(zip, {
delimiters: {
start: "{",
end: "}"
}
});

doc.render({
vertrag: req.body.vertrag,
datum: req.body.retour,
artikel: req.body.artikel,
vermieter: req.body.vermieter,
mitarbeiter: req.body.mitarbeiter,
schaden: req.body.schaden
});

const buf = doc.getZip().generate({
type: "nodebuffer"
});

libre.convert(buf, ".pdf", undefined, (err, done) => {

if (err) {
console.log(err);
return res.status(500).send("PDF Fehler");
}

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "attachment; filename=Schadenerfassung.pdf");

res.end(done);

});

} catch (error) {

console.log(error);
res.status(500).send("Template Fehler");

}

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log("Server läuft auf Port " + PORT);
});
