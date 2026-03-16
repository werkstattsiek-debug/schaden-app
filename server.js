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

    const templatePath = path.join(__dirname, "template", "schadenerfassung.docx");

    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip);

    doc.setData({
        vertrag: req.body.vertrag,
        datum: req.body.retour,
        artikel: req.body.artikel,
        vermieter: req.body.vermieter,
        schaden: req.body.schaden,
        kosten: req.body.kosten,
        mitarbeiter: req.body.mitarbeiter
    });

    try {
        doc.render();
    } catch (error) {
        console.log(error);
        return res.status(500).send("Fehler beim Befüllen des Dokuments");
    }

    const outputDocx = path.join(__dirname, "output.docx");

    const buffer = doc.getZip().generate({
        type: "nodebuffer",
    });

    fs.writeFileSync(outputDocx, buffer);

    const outputPdf = path.join(__dirname, "output.pdf");

    execSync(`libreoffice --headless --convert-to pdf "${outputDocx}" --outdir "${__dirname}"`);

    res.download(outputPdf, `Schadenerfassung_${req.body.vertrag}.pdf`);

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server läuft auf Port " + PORT);
});
