import { Router } from "express";
const filePath = "../json/kontakt.json";
const fs = require("fs");

const kontaktRouter = Router();

kontaktRouter.post("/kontakt", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    aboutData.facebook = req.body.facebook ?? null;
    aboutData.instagram = req.body.instagram ?? null;
    aboutData.phone = req.body.phone ?? null;
    aboutData.email = req.body.email ?? null;
    aboutData.adresa = req.body.adresa ?? null;
    aboutData.coordinate = req.body.coordinate ?? null;
    aboutData.radnimDanima = req.body.radnimDanima ?? null;
    aboutData.subotom = req.body.subotom ?? null;
    aboutData.nedeljom = req.body.nedeljom ?? null;

    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

kontaktRouter.get("/kontakt", async (req, res) => {
  const jsonData = fs.readFileSync(filePath, "utf8");
  console.log("sjon", jsonData);
  let aboutData = JSON.parse(jsonData);
  res.send(aboutData);
});

export { kontaktRouter };
