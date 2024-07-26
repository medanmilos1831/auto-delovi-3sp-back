import { Router } from "express";
import { aboutUpload } from "../multer/aboutStorage";
const filePath = "src/json/onama.json";
const fs = require("fs");

const aboutRouter = Router();

aboutRouter.post("/upload-about", aboutUpload.single("file"), (req, res) => {
  res.send("ok");
});

aboutRouter.post("/about", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    aboutData.headline = req.body.headline || aboutData.headline;
    aboutData.opis = req.body.opis || aboutData.opis;
    aboutData.items = req.body.items || aboutData.items;
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(422).send("Nesto nije ok");
  }
});

aboutRouter.get("/about", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
  } catch (error: any) {
    res.status(422).send("Nesto nije ok");
  }
});

export { aboutRouter };
