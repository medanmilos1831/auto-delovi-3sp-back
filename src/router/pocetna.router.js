// Import necessary modules
const { Router } = require("express");
const uploadPocetna = require("../multer/pocetnaStorage");
const fs = require("fs/promises");
const path = require("path");
const xlsx = require("xlsx"); // Include this if you're using it for handling Excel files

// Define file paths
const filePath = path.join(__dirname, "../json/pocetna.json");
const programJson = path.join(__dirname, "../json/program.json");

// Create router instance
const pocetnaRouter = Router();

// Function to preserve images
const preserveImages = (newData, oldData) => {
  Object.keys(newData).forEach((programKey) => {
    const newProgram = newData[programKey];
    const oldProgram = oldData[programKey];

    if (oldProgram && oldProgram.kategorije) {
      Object.keys(newProgram.kategorije).forEach((categoryKey) => {
        const newCategory = newProgram.kategorije[categoryKey];
        const oldCategory = oldProgram.kategorije[categoryKey];

        if (oldCategory && oldCategory.prozivodi) {
          Object.keys(newCategory.prozivodi).forEach((productKey) => {
            const newProduct = newCategory.prozivodi[productKey];
            const oldProduct = oldCategory.prozivodi[productKey];

            if (oldProduct) {
              // Preserve images from the old JSON if they exist
              if (oldProduct.image) {
                newProduct.image = oldProduct.image;
                newProduct.imageName = oldProduct.imageName;
              }
            }
          });
        }
      });
    }
  });

  return newData;
};

// Define routes
pocetnaRouter.post(
  "/upload-pocetna",
  uploadPocetna.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

pocetnaRouter.post("/pocetna", async (req, res) => {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    aboutData.headline = req.body.headline ?? null;
    aboutData.desc = req.body.desc ?? null;
    const updatedJsonData = JSON.stringify(aboutData, null, 2);
    await fs.writeFile(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

pocetnaRouter.get("/pocetna", async (req, res) => {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    let programi = JSON.parse(await fs.readFile(programJson, "utf8"));
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

// Setup multer for file upload
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

pocetnaRouter.post(
  "/pocetna/excel",
  upload.single("file"),
  async (req, res) => {
    try {
      // Load data from buffer
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet from the Excel file
      const worksheet = workbook.Sheets[sheetName];

      // Parse the Excel sheet to JSON format
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      let oldData;
      try {
        oldData = JSON.parse(await fs.readFile(programJson, "utf8"));
      } catch (error) {
        oldData = {}; // If the file does not exist or is empty, use an empty object
      }

      const createObjectFromData = (data) => {
        const result = {};
        data.forEach((item, i) => {
          const key =
            item.ARTIKAL_ID > 50000 && item.ARTIKAL_ID < 60000
              ? "traktorski-program"
              : "auto-program";
          const firstWord = item.NAZIV.split(" ")[0].toLowerCase();
          const productSlug = item.NAZIV.toLowerCase().replace(/\s+/g, "-");
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
          const productSlug = item.NAZIV.toLowerCase().replace(/\s+/g, "-");
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
              cena: item.PRODAJNA_SA_PDV,
              kataloski_broj: item.SIF_PROIZVODJACA,
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
      newData = preserveImages(newData, oldData);
      const updatedJsonData = JSON.stringify(newData, null, 2);
      await fs.writeFile(programJson, updatedJsonData, "utf8");

      res.send("ok");
    } catch (error) {
      console.error("Error processing Excel file:", error);
      res.status(500).send("Error processing file");
    }
  }
);

module.exports = pocetnaRouter;
