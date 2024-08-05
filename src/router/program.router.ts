import { Router } from "express";
import slugify from "slugify";
import { uploadProgram } from "../multer";
const fs = require("fs");
const filePath = "src/json/program.json";

const programRouter = Router();

programRouter.post("/upload", uploadProgram.single("file"), (req, res) => {
  res.send("ok");
});

programRouter.post("/program", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    if (jsonArray[slug]) {
      throw {
        code: 422,
        message: "vec postoji program",
      };
    }
    jsonArray[slug] = {
      ...req.body,
      slug,
      kategorije: {},
    };
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.get("/program", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    res.send(
      Object.keys(jsonArray).length === 0 ? [] : Object.values(jsonArray)
    );
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.delete("/program/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    delete jsonArray[req.params.id];
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.put("/program/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    if (req.params.id != slug && jsonArray[slug]) {
      throw {
        code: 422,
        message: "vec postoji program",
      };
    }
    jsonArray[slug] = {
      ...jsonArray[req.params.id],
      slug,
      ...req.body,
    };
    if (req.params.id != slug) {
      delete jsonArray[req.params.id];
    }

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.get("/program/:program", async (req, res) => {
  try {
    let jsonArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!jsonArray[req.params.program]) {
      return res.send([]);
    }

    const categories: any = [];

    // Iteriramo kroz sve programe u JSON objektu
    for (const programKey in jsonArray) {
      if (Object.hasOwnProperty.call(jsonArray, programKey)) {
        const program = jsonArray[programKey];

        // Iteriramo kroz sve kategorije u svakom programu
        for (const categoryKey in program.kategorije) {
          if (Object.hasOwnProperty.call(program.kategorije, categoryKey)) {
            const category = program.kategorije[categoryKey];

            // Izvlačimo slug i naziv kategorije
            const { slug, naziv, desc, caption, image, imageName } = category;

            // Dodajemo kategoriju u listu sa slug-om i nazivom
            categories.push({ slug, naziv, desc, caption, image, imageName });
          }
        }
      }
    }
    res.send({
      naziv: jsonArray[req.params.program]?.naziv ?? null,
      caption: jsonArray[req.params.program]?.caption ?? null,
      desc: jsonArray[req.params.program]?.desc ?? null,
      image: jsonArray[req.params.program]?.image ?? null,
      imageName: jsonArray[req.params.program]?.imageName ?? null,
      category: (() => {
        if (!jsonArray[req.params.program].kategorije) {
          return [];
        }
        return Object.values(jsonArray[req.params.program].kategorije);
      })(),
    });
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { programRouter };
