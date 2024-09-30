import { Router } from "express";
import { programRouter } from "./program.router";
import { uploadPocetna } from "../multer";
const filePath = "src/json/pocetna.json";
const programJson = "src/json/program.json";
const fs = require("fs");
const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");

const pocetnaRouter = Router();

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
              // Očuvaj slike iz starog JSON-a ako postoje
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

pocetnaRouter.post("/pocetna/excel", upload.single("file"), (req: any, res) => {
  try {
    // Učitajte podatke iz buffer-a
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Uzmite prvi sheet iz Excel fajla
    const worksheet = workbook.Sheets[sheetName];

    // Parsiranje Excel sheet-a u JSON format
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    let oldData;
    try {
      oldData = JSON.parse(fs.readFileSync(programJson, "utf8"));
    } catch (error) {
      oldData = {}; // Ako fajl ne postoji ili je prazan, koristi prazan objekat
    }
    // Šaljemo JSON podatke kao odgovor ili nastavljamo obradu
    // console.log(jsonData); // Ispis podataka iz Excel fajla
    const createObjectFromData = (data) => {
      const result = {};

      data.forEach((item) => {
        const key =
          item.ARTIKAL_ID > 50000 && item.ARTIKAL_ID < 60000
            ? "traktorski-program"
            : "auto-program";
        console.log("item.naziv", item);
        const firstWord = item.NAZIV.split(" ")[0].toLowerCase();
        const productSlug = item.NAZIV.toLowerCase().replace(/\s+/g, "-");

        if (!result[key]) {
          result[key] = {
            naziv:
              key === "auto-program" ? "auto program" : "traktorski program",
            caption: null,
            desc: null,
            slug: key,
            kategorije: {
              [firstWord]: {
                slug: firstWord,
                naziv: firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
                caption: null,
                desc: null,
                prozivodi: {
                  [productSlug]: {
                    naziv: item.NAZIV,
                    opis: item.NAZIV,
                    caption: null,
                    cena: item.PRODAJNA_SA_PDV,
                    kataloski_broj: item.SIF_PROIZVODJACA,
                    image: null,
                    imageName: null,
                    items: null,
                    slug: productSlug,
                  },
                },
                imageName: null,
                image: null,
              },
            },
            imageName: null,
            image: null,
          };
        } else {
          if (!result[key].kategorije[firstWord]) {
            result[key].kategorije[firstWord] = {
              slug: firstWord,
              naziv: firstWord.charAt(0).toUpperCase() + firstWord.slice(1),
              caption: null,
              desc: null,
              prozivodi: {
                [productSlug]: {
                  naziv: item.NAZIV,
                  opis: item.NAZIV,
                  caption: null,
                  cena: item.PRODAJNA_SA_PDV,
                  kataloski_broj: item.SIF_PROIZVODJACA,
                  image: null,
                  imageName: null,
                  items: null,
                  slug: productSlug,
                },
              },
              imageName: null,
              image: null,
            };
          } else {
            result[key].kategorije[firstWord].prozivodi[productSlug] = {
              naziv: item.NAZIV,
              opis: item.NAZIV,
              caption: null,
              cena: item.PRODAJNA_SA_PDV,
              kataloski_broj: item.SIF_PROIZVODJACA,
              image: null,
              imageName: null,
              items: null,
              slug: productSlug,
            };
          }
        }
      });

      return result;
    };
    // console.log("createObjectFromData", jsonData[0]);
    console.log("createObjectFromData", createObjectFromData(jsonData));
    let newData = createObjectFromData(jsonData);
    newData = preserveImages(newData, oldData);
    const updatedJsonData = JSON.stringify(newData, null, 2);
    fs.writeFileSync(programJson, updatedJsonData, "utf8");

    // Upisivanje u JSON fajl
    // const updatedJsonData = JSON.stringify(newData, null, 2);
    // fs.writeFileSync(programJson, updatedJsonData, "utf8");
    // res.send(jsonData); // Možete vratiti podatke kao odgovor ili ih dalje procesuirati
  } catch (error) {
    console.error("Error processing Excel file:", error);
    // res.status(500).send("Error processing file");
  }
  // Učitavanje starog JSON-a

  // const generateUniqueIds = (start, end, count) => {
  //   const ids = new Set();
  //   while (ids.size < count) {
  //     const id = Math.floor(Math.random() * (end - start + 1)) + start;
  //     ids.add(id);
  //   }
  //   return Array.from(ids);
  // };

  // const generateData = (numItems) => {
  //   const half = numItems / 2;

  //   // Generiši 3000 jedinstvenih ID-ova u opsegu 50000-60000
  //   const traktorskiProgramIds = generateUniqueIds(50000, 60000, half);

  //   // Generiši 3000 jedinstvenih ID-ova u opsegu 1-49999
  //   const autoProgramIds = generateUniqueIds(1, 49999, half);

  //   const ids = [...traktorskiProgramIds, ...autoProgramIds];
  //   const categories = [
  //     "filteri",
  //     "pločice",
  //     "gume",
  //     "svečice",
  //     "akumulatori",
  //     "pumpa-za-gorivo",
  //     "zamajac",
  //     "kočioni-diskovi",
  //     "kočione-pločice",
  //     "španeri",
  //     "ulje-za-motor",
  //     "mjenjač",
  //     "remenice",
  //     "alternator",
  //     "starter",
  //     "egr-ventil",
  //     "hladnjak",
  //     "kondenzator",
  //     "termostat",
  //     "zračni-filter",
  //     "uljni-filter",
  //     "paljenje",
  //     "razvodna-kapica",
  //     "razvodnik",
  //     "nosaci",
  //     "opruga",
  //     "stabilizatori",
  //     "zračnice",
  //     "škrge",
  //     "zatvarači",
  //     "rukohvati",
  //     "gornji-nosač",
  //     "donji-nosač",
  //     "zračni-rezervoar",
  //     "hladnjak-za-ulje",
  //     "čarape-za-gume",
  //     "upravljač",
  //     "kablovi",
  //     "prigušivač",
  //     "razvodnik-goriva",
  //     "pumpe-za-vodu",
  //     "ležajevi",
  //     "distributer",
  //     "silikoni",
  //     "električni-sistem",
  //     "navigacija",
  //     "kamera-za-vožnju",
  //     "parking-senzori",
  //     "isporuka",
  //     "ulja-i-maziva",
  //   ];

  //   const data = ids.map((id, index) => {
  //     const isTraktorskiProgram = traktorskiProgramIds.includes(id);
  //     const category =
  //       categories[Math.floor(Math.random() * categories.length)];
  //     const opis = `${category.charAt(0).toUpperCase() + category.slice(1)} ${
  //       index + 1
  //     }`;
  //     const cena = Math.floor(Math.random() * 5000) + 100;
  //     const kataloskiBroj = Math.floor(Math.random() * 1000) + 1;

  //     return { id, opis, cena, kataloski_broj: kataloskiBroj };
  //   });

  //   return data;
  // };

  // Generiši podatke
  // const d = generateData(6000);

  // console.log("createObjectFromData", createObjectFromData(jsonData));
  // let newData = createObjectFromData([
  //   ...d,
  //   { cena: 99999, id: 1, kataloski_broj: 1, opis: "milos" },
  // ]);

  // Očuvaj slike iz starog JSON-a
  // newData = preserveImages(newData, oldData);

  // // Upisivanje u JSON fajl
  // // const updatedJsonData = JSON.stringify(newData, null, 2);
  // // fs.writeFileSync(programJson, updatedJsonData, "utf8");

  res.send("ok");
});

export { pocetnaRouter };
