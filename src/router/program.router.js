const { Router } = require("express");
const slugify = require("slugify");
const uploadProgram = require("../multer/programStorage");
const fs = require("fs");
const path = require("path");

const programRouter = Router();

programRouter.post("/upload", uploadProgram.single("file"), (req, res) => {
  res.send("ok");
});

programRouter.get("/program", async (req, res) => {
  try {
    console.log("eeeee");
    // const jsonData = fs.readFileSync(filePath, "utf8");
    // let jsonArray = JSON.parse(jsonData);
    let jsonArray = req.sharedData.program;
    res.send(
      Object.keys(jsonArray).length === 0
        ? []
        : (() => {
            return Object.keys(jsonArray).map((key) => {
              const { kategorije, ...rest } = jsonArray[key];
              return rest;
            });
          })()
    );
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

programRouter.get("/program/:program", async (req, res) => {
  try {
    // let jsonArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let jsonArray = req.sharedData.program;
    if (!jsonArray[req.params.program]) {
      return res.send([]);
    }

    const categories = [];

    for (const programKey in jsonArray) {
      if (Object.hasOwnProperty.call(jsonArray, programKey)) {
        const program = jsonArray[programKey];

        for (const categoryKey in program.kategorije) {
          if (Object.hasOwnProperty.call(program.kategorije, categoryKey)) {
            const category = program.kategorije[categoryKey];

            const { slug, naziv, desc, caption, image, imageName } = category;

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
        const v = Object.values(jsonArray[req.params.program].kategorije);
        const kategorijeBezProizvoda = Object.values(
          jsonArray[req.params.program].kategorije
        ).map((kategorija) => {
          const { prozivodi, ...rest } = kategorija;

          return {
            ...rest,
            firstId: Object.values(prozivodi)[0].id || null,
          };
        });

        return kategorijeBezProizvoda;
      })(),
    });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

module.exports = programRouter; // Change this line
