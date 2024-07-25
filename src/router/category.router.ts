import { Router } from "express";
import slugify from "slugify";
import { uploadCategory } from "../multer";
const fs = require("fs");
const filePath = "../json/program.json";

const categoryRoute = Router();

categoryRoute.post(
  "/upload-category",
  uploadCategory.single("file"),
  (req, res) => {
    res.send("ok");
  }
);
categoryRoute.post("/category", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    function checkForKey(jsonObj, keyToCheck) {
      for (const key in jsonObj) {
        if (jsonObj[key].kategorije && jsonObj[key].kategorije[keyToCheck]) {
          return true;
        }
      }
      return false;
    }
    const keyExists = checkForKey(jsonArray, slug);
    if (keyExists) {
      throw {
        code: 422,
        message: "vec postoji kategorija",
      };
    }

    const { programId, ...rest } = req.body;
    req.body.programId.forEach((i) => {
      jsonArray[i].kategorije[slug] = {
        ...jsonArray[i].kategorije[slug],
        slug,
        ...rest,
        prozivodi: {},
        image: null,
        imageName: null,
      };
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.put("/category/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const { naziv, caption, desc, programId } = req.body;
    const oldCategoryId = req.params.id;

    // Generisanje sluga iz naziva
    const newCategorySlug = slugify(naziv, {
      lower: true,
      strict: true,
    });

    // Provera da li je naziv kategorije promenjen
    let isNameChanged = false;
    let currentCategory: any = null;

    // Iteriramo kroz sve programe i kategorije da pronađemo trenutnu kategoriju
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]: [string, any]) => {
            if (categorySlug === oldCategoryId) {
              currentCategory = category;
              if (category.naziv !== naziv) {
                isNameChanged = true;
              }
            }
          }
        );
      }
    );

    if (!currentCategory) {
      throw new Error("Category not found");
    }

    // Provera da li novi naziv već postoji ako je naziv promenjen
    if (isNameChanged) {
      let nameExists = false;

      Object.entries(jsonArray).forEach(
        ([programSlug, program]: [string, any]) => {
          Object.entries(program.kategorije).forEach(
            ([categorySlug, category]: [string, any]) => {
              if (categorySlug === newCategorySlug) {
                nameExists = true;
              }
            }
          );
        }
      );

      if (nameExists) {
        throw new Error("Category slug already exists");
      }

      // Ako je naziv promenjen, ažuriramo naziv u kategorijama
      Object.entries(jsonArray).forEach(
        ([programSlug, program]: [string, any]) => {
          if (program.kategorije[oldCategoryId]) {
            const categoryData = { ...program.kategorije[oldCategoryId] };
            delete program.kategorije[oldCategoryId];
            program.kategorije[newCategorySlug] = categoryData;
          }
        }
      );
    }

    // Ažuriramo informacije o kategoriji
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        if (program.kategorije[newCategorySlug]) {
          program.kategorije[newCategorySlug] = {
            ...program.kategorije[newCategorySlug],
            naziv: naziv,
            caption: caption,
            desc: desc,
          };
        }
      }
    );

    // Prvo uklonimo kategoriju iz programa koji više nisu u listi programId
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        if (
          program.kategorije[newCategorySlug] &&
          !programId.includes(programSlug)
        ) {
          delete program.kategorije[newCategorySlug];
        }
      }
    );

    // Dodamo kategoriju u nove programe iz liste programId
    programId.forEach((newProgramSlug) => {
      if (jsonArray[newProgramSlug]) {
        jsonArray[newProgramSlug].kategorije[newCategorySlug] = {
          slug: newCategorySlug,
          naziv: naziv,
          caption: caption,
          desc: desc,
          prozivodi: currentCategory.prozivodi || {},
        };
      }
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.delete("/category/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        if (program.kategorije && program.kategorije[req.params.id]) {
          delete program.kategorije[req.params.id];
        }
      }
    );
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.get("/category", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    function extractUniqueCategoriesWithProgram(jsonData: any): any[] {
      const uniqueCategories: any[] = [];

      // Funkcija za kopiranje objekta bez prozivodi polja
      function copyWithoutProducts(obj: any): any {
        const { prozivodi, ...rest } = obj;
        return rest;
      }

      // Iteriramo kroz svaki program
      Object.entries(jsonData).forEach(
        ([programSlug, program]: [string, any]) => {
          // Iteriramo kroz kategorije u svakom programu
          Object.entries(program.kategorije).forEach(
            ([categorySlug, category]: [string, any]) => {
              // Proveravamo da li kategorija već postoji u uniqueCategories po slug-u
              const existingCategory = uniqueCategories.find(
                (cat: any) => cat.slug === category.slug
              );
              if (!existingCategory) {
                // Ako kategorija ne postoji, dodajemo je u uniqueCategories
                uniqueCategories.push({
                  ...copyWithoutProducts(category),
                  program: [{ value: program.slug, label: program.naziv }], // Krećemo sa nizom koji sadrzi { value: program.slug, label: program.naziv }
                });
              } else {
                // Ako kategorija već postoji, dodajemo { value: program.slug, label: program.naziv } u niz programa
                existingCategory.program.push({
                  value: program.slug,
                  label: program.naziv,
                });
              }
            }
          );
        }
      );

      return uniqueCategories;
    }

    res.send(extractUniqueCategoriesWithProgram(jsonArray));
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.get("/category/:program/:category", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    const program = jsonArray[req.params.program];
    if (!program) {
      return res.send({
        products: [],
        category: null,
      });
    }
    const cat = program.kategorije[req.params.category];
    if (!cat) {
      return res.send({
        products: [],
        category: null,
      });
    }
    return res.send({
      products: Object.values(cat.prozivodi),
      category: (() => {
        const { prozivodi, ...rest } = cat;
        return rest;
      })(),
    });
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { categoryRoute };
