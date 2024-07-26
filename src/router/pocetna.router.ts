import { Router } from "express";
import { programRouter } from "./program.router";
import { uploadPocetna } from "../multer";
const filePath = "src/json/pocetna.json";
const programJson = "src/json/program.json";
const fs = require("fs");

const pocetnaRouter = Router();

programRouter.post(
  "/upload-pocetna",
  uploadPocetna.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

pocetnaRouter.post("/pocetna", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    aboutData.headline = req.body.headline ?? null;
    aboutData.desc = req.body.desc ?? null;
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

pocetnaRouter.get("/pocetna", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);

    let programi = JSON.parse(fs.readFileSync(programJson, "utf8"));
    const programs: any = [];

    // Iteriramo kroz sve ključeve u JSON objektu
    for (const key in programi) {
      if (Object.hasOwnProperty.call(programi, key)) {
        const program = programi[key];

        // Izvlačimo naziv (naziv) i slug (slug) programa
        const { naziv, slug, image, caption } = program as any;

        // Dodajemo program u listu sa nazivom i slug-om
        programs.push({ naziv, slug, image, caption });
      }
    }

    res.send({
      ...aboutData,
      programi: programs,
    });
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { pocetnaRouter };
