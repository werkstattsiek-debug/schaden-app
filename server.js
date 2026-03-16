
const express=require("express")
const multer=require("multer")
const fs=require("fs")
const path=require("path")
const {execSync}=require("child_process")

const app=express()
const upload=multer({dest:"uploads/"})

app.use(express.static("public"))

app.post("/create",upload.array("bilder"),(req,res)=>{

const template=path.join(__dirname,"template","schadenerfassung.docx")
const outdir=path.join(__dirname,"output")

if(!fs.existsSync(outdir))fs.mkdirSync(outdir)

execSync(`libreoffice --headless --convert-to pdf "${template}" --outdir "${outdir}"`)

const pdf=path.join(outdir,"schadenerfassung.pdf")

res.download(pdf)

})

app.listen(3000,()=>console.log("Server läuft auf Port 3000"))
