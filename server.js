const express = require("express");
const multer = require("multer");
const PDFDocument = require("pdfkit");

const app = express();

const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/create", upload.array("bilder"), (req, res) => {

try {

const doc = new PDFDocument();

res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", "attachment; filename=Schadenerfassung.pdf");

doc.pipe(res);

doc.fontSize(22).text("Schadenerfassung", { align: "center" });
doc.moveDown();

doc.fontSize(12);
doc.text("Vertragsnummer: " + (req.body.vertrag || ""));
doc.text("Retourdatum: " + (req.body.retour || ""));
doc.text("Artikel: " + (req.body.artikel || ""));
doc.text("Vermieter: " + (req.body.vermieter || ""));
doc.text("Dokumentiert von: " + (req.body.mitarbeiter || ""));

doc.moveDown();
doc.text("Art des Schadens:");
doc.text(req.body.schaden || "");

doc.moveDown();
doc.text("Kosten des Schadens: " + (req.body.kosten || ""));

doc.end();

} catch(err) {

console.log(err);
res.status(500).send("PDF Fehler");

}

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
console.log("Server läuft auf Port " + PORT);
});
