const { Router } = require("express");
const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const pocetnaUpload = require("../multer/pocetnaStorage");

const programJson = path.join(__dirname, "../../json/program.json");

const pocetnaRouter = Router();

pocetnaRouter.post(
  "/upload-pocetna",
  pocetnaUpload.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

pocetnaRouter.get("/pocetna", async (req, res) => {
  try {
    const aboutData = req.sharedData.pocetna;
    const programi = req.sharedData.program;
    const programs = [];

    // Iterate through all keys in the JSON object
    for (const key in programi) {
      if (Object.hasOwnProperty.call(programi, key)) {
        const program = programi[key];
        const { naziv, slug, image, caption } = program;
        programs.push({ naziv, slug, image, caption });
      }
    }

    res.send({
      ...aboutData,
      programi: programs,
    });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});
pocetnaRouter.post("/pocetna", async (req, res) => {
  try {
    const jsonArray = req.sharedData.pocetna;
    const filePath = path.join(__dirname, "../../json/pocetna.json");
    jsonArray.headline = req.body.headline || jsonArray.headline;

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    await fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

pocetnaRouter.post("/pocetna/excel", async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet from the Excel file
    const worksheet = workbook.Sheets[sheetName];

    // Parse the Excel sheet to JSON format
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    req.sharedData.program = {};
    fs.writeFileSync(programJson, JSON.stringify({}, null, 2), "utf8");

    const createObjectFromData = (data) => {
      const result = {};
      data.forEach((item, i) => {
        const key =
          item.ARTIKAL_ID > 50000 && item.ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program";
        if (!result[key]) {
          result[key] = {
            naziv:
              key === "auto-program" ? "auto program" : "traktorski program",
            caption: null,
            desc: null,
            slug: key,
            kategorije: {},
          };
        }
      });

      data.forEach((item, i) => {
        const key =
          item.ARTIKAL_ID > 50000 && item.ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program";
        const firstWord = item.NAZIV.split(" ")[0].toLowerCase();
        if (!result[key].kategorije[firstWord]) {
          result[key].kategorije[firstWord] = {
            slug: firstWord,
            naziv: firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
            caption: null,
            desc: null,
            prozivodi: {},
          };
        }
      });

      data.forEach((item, i) => {
        const key =
          item.ARTIKAL_ID > 50000 && item.ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program";
        const firstWord = item.NAZIV.split(" ")[0].toLowerCase();
        const productSlug = item.NAZIV.toLowerCase().replace(/\s+/g, "-");

        result[key].kategorije[firstWord].prozivodi = {
          ...result[key].kategorije[firstWord].prozivodi,
          [`${productSlug}_${item.ARTIKAL_ID}`]: {
            naziv: item.NAZIV,
            opis: item.NAZIV,
            caption: null,
            napomena: item.NAPOMENA,
            proizvodjac: item.PROIZVODJAC,
            cena: item.PRODAJNA_SA_PDV,
            kataloski_broj: item.SIF_PROIZVODJACA,
            jm: item.JM,
            PAK: item.PAK,
            image: null,
            imageName: null,
            items: null,
            slug: `${productSlug}_${item.ARTIKAL_ID}`,
            id: item.ARTIKAL_ID,
          },
        };
      });

      return result;
    };

    let newData = createObjectFromData(jsonData);
    // newData = preserveImages(newData, oldData);
    req.sharedData.program = newData;
    // const c = JSON.stringify(newData, null, 2);
    // fs.writeFileSync(programJson, JSON.stringify({}, null, 2), "utf8");
    const updatedJsonData = JSON.stringify(newData, null, 2);
    await fs.writeFileSync(programJson, updatedJsonData, "utf8");

    res.send("ok");
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res.status(500).send("Error processing file");
  }
});

module.exports = pocetnaRouter;
