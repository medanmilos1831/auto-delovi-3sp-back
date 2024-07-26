import { Router } from "express";
import { Program } from "../models/Program";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { ProgramCategory } from "../models/ProgramCategory";
import slugify from "slugify";
import { uploadProduct } from "../multer/productStorage";
const nodemailer = require("nodemailer");
const fs = require("fs");
const filePath = "src/json/program.json";
const productRouter = Router();

productRouter.post(
  "/uploads/product",
  uploadProduct.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

productRouter.post("/product", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    for (const programKey of Object.keys(jsonArray)) {
      const program = jsonArray[programKey];
      if (program && program.kategorije) {
        for (const categoryKey of Object.keys(program.kategorije)) {
          const category = program.kategorije[categoryKey];
          if (category && category.prozivodi) {
            if (category.prozivodi[req.body.naziv]) {
              throw {
                code: 422,
                message: "vec postoji proizvod",
              };
            }
          }
        }
      }
    }
    req.body.programId.forEach((program) => {
      jsonArray[program].kategorije[req.body.categoryId].prozivodi = {
        ...jsonArray[program].kategorije[req.body.categoryId].prozivodi,
        [slug]: {
          naziv: req.body.naziv ?? null,
          opis: req.body.opis ?? null,
          caption: req.body.caption ?? null,
          cena: req.body.cena ?? null,
          kataloski_broj: req.body.kataloski_broj ?? null,
          image: null,
          imageName: null,
          items: req.body.items ?? null,
          slug: slugify(req.body.naziv, {
            lower: true,
            strict: true,
          }),
        },
      };
    });
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.put("/product/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const { naziv, caption, cena, opis, categoryId, programId, items } =
      req.body;
    const oldProductId = req.params.id;

    // Generisanje sluga iz naziva
    const newProductSlug = slugify(naziv, {
      lower: true,
      strict: true,
    });

    // Provera da li je naziv proizvoda promenjen
    let isNameChanged = false;
    let currentProduct: any = null;

    // Iteriramo kroz sve programe i kategorije da pronađemo trenutni proizvod
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]: [string, any]) => {
            if (category.prozivodi && category.prozivodi[oldProductId]) {
              currentProduct = category.prozivodi[oldProductId];
              if (currentProduct.naziv !== naziv) {
                isNameChanged = true;
              }
            }
          }
        );
      }
    );

    if (!currentProduct) {
      throw new Error("Product not found");
    }

    // Provera da li novi naziv već postoji ako je naziv promenjen
    if (isNameChanged) {
      let nameExists = false;

      Object.entries(jsonArray).forEach(
        ([programSlug, program]: [string, any]) => {
          Object.entries(program.kategorije).forEach(
            ([categorySlug, category]: [string, any]) => {
              if (category.prozivodi && category.prozivodi[newProductSlug]) {
                nameExists = true;
              }
            }
          );
        }
      );

      if (nameExists) {
        throw new Error("Product slug already exists");
      }

      // Ako je naziv promenjen, ažuriramo naziv u proizvodima
      Object.entries(jsonArray).forEach(
        ([programSlug, program]: [string, any]) => {
          Object.entries(program.kategorije).forEach(
            ([categorySlug, category]: [string, any]) => {
              if (category.prozivodi && category.prozivodi[oldProductId]) {
                const productData = { ...category.prozivodi[oldProductId] };
                delete category.prozivodi[oldProductId];
                category.prozivodi[newProductSlug] = productData;
              }
            }
          );
        }
      );
    }

    // Ažuriramo informacije o proizvodu
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]: [string, any]) => {
            if (category.prozivodi && category.prozivodi[newProductSlug]) {
              category.prozivodi[newProductSlug] = {
                ...category.prozivodi[newProductSlug],
                naziv: naziv,
                caption: caption,
                cena: cena,
                opis: opis,
                items: items,
                slug: newProductSlug,
              };
            }
          }
        );
      }
    );

    // Prvo uklonimo proizvod iz programa koji više nisu u listi programId
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]: [string, any]) => {
            if (
              category.prozivodi &&
              category.prozivodi[newProductSlug] &&
              !programId.includes(programSlug)
            ) {
              delete category.prozivodi[newProductSlug];
            }
          }
        );
      }
    );

    // Dodamo proizvod u nove programe iz liste programId
    programId.forEach((newProgramSlug) => {
      categoryId.forEach((newCategorySlug) => {
        if (
          jsonArray[newProgramSlug] &&
          jsonArray[newProgramSlug].kategorije[newCategorySlug]
        ) {
          jsonArray[newProgramSlug].kategorije[newCategorySlug].prozivodi[
            newProductSlug
          ] = {
            slug: newProductSlug,
            naziv: naziv,
            caption: caption,
            cena: cena,
            opis: opis,
            items: items,
          };
        }
      });
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.get("/product", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueProducts: any[] = [];
    const seenProducts: Map<string, any> = new Map(); // Mapa za praćenje jedinstvenih proizvoda na osnovu sluga

    // Iteriramo kroz sve programe u jsonData
    Object.entries(jsonArray).forEach(
      ([programSlug, program]: [string, any]) => {
        if (program && program.kategorije) {
          // Iteriramo kroz sve kategorije u programu
          Object.entries(program.kategorije).forEach(
            ([categorySlug, category]: [string, any]) => {
              if (category && category.prozivodi) {
                // Iteriramo kroz sve proizvode u kategoriji
                Object.entries(category.prozivodi).forEach(
                  ([productSlug, product]: [string, any]) => {
                    const productKey = product.slug; // Koristimo slug kao jedinstveni ključ

                    // Ako proizvod nije već viđen, dodajemo ga u mapu seenProducts
                    if (!seenProducts.has(productKey)) {
                      seenProducts.set(productKey, {
                        ...product,
                        programs: [
                          { value: programSlug, label: program.naziv },
                        ], // Kreiramo novo polje 'programs'
                        categories: [
                          { value: category.slug, label: category.naziv },
                        ], // Dodajemo kategoriju u novom formatu
                      });
                    } else {
                      // Ako proizvod već postoji, dodajemo programSlug u listu 'programs'
                      const existingProduct = seenProducts.get(productKey);
                      if (existingProduct) {
                        existingProduct.programs.push({
                          value: programSlug,
                          label: program.naziv,
                        });
                      }
                      // Dodajemo kategoriju u novom formatu ako već nije prisutna za ovaj proizvod
                      const newCategory = {
                        value: category.slug,
                        label: category.naziv,
                      };
                      if (
                        !existingProduct.categories.find(
                          (cat: any) => cat.value === newCategory.value
                        )
                      ) {
                        existingProduct.categories.push(newCategory);
                      }
                    }
                  }
                );
              }
            }
          );
        }
      }
    );

    // Konvertujemo mapu u niz jedinstvenih proizvoda
    seenProducts.forEach((product) => {
      uniqueProducts.push(product);
    });

    res.send(uniqueProducts);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.get("/product/:id", async (req, res) => {
  try {
    const product: any = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProgramCategory,
          through: {
            attributes: [],
          },
        },
        {
          model: Category,
          through: {
            attributes: [],
          },
        },
        {
          model: Program,
          through: {
            attributes: [],
          },
        },
      ],
      // raw: true,
      nest: true,
    });
    if (!product) {
      throw {
        code: 422,
        message: "nema proizoda",
      };
    }
    res.send(product);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.delete("/product/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const productIdToDelete = req.params.id;

    // Iteriramo kroz sve programe i kategorije da pronađemo i obrišemo proizvod
    Object.entries(jsonArray).forEach(([programSlug, program]: any) => {
      Object.entries(program.kategorije).forEach(
        ([categorySlug, category]: any) => {
          if (category.prozivodi && category.prozivodi[productIdToDelete]) {
            delete category.prozivodi[productIdToDelete];
          }
        }
      );
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("Product deleted successfully");
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

productRouter.get("/product/:program/:category/:product", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    const program = jsonArray[req.params.program];
    if (!program) {
      throw {
        code: 500,
        message: "nema tog proizvda",
      };
    }
    const cat = program.kategorije[req.params.category];
    if (!cat) {
      throw {
        code: 500,
        message: "nema tog proizvda",
      };
    }
    if (!cat.prozivodi[req.params.product]) {
      throw {
        code: 500,
        message: "nema tog proizvda",
      };
    }
    return res.send(cat.prozivodi[req.params.product]);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.post("/naruci", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // ili drugi email servis
      auth: {
        user: "srba3sp@gmail.com",
        pass: "pdoy mngj pzwz gcpn",
      },
    });
    // pdoy mngj pzwz gcpn

    // Srba3sp1987+
    // srba3sp@gmail.com
    const formatter = new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
    });
    const items = req.body.products
      .map(
        (item: any) => `
      <tr>
        <td>${item.product.naziv}</td>
        <td>${item.qty}</td>
        <td>${formatter.format(item.product.cena)}</td>
        <td>${item.product.kataloski_broj}</td>
      </tr>
    `
      )
      .join("");
    const htmlContent = `
      <p>Detalji narudžbe su prikazani ispod:</p>
      <span>Kontakt mail: ${
        req.body.email ? req.body.email : "Korisnik nije ostavio email"
      }<span/>
      <br />
      <span>Kontakt telefon: ${
        req.body.phone ? req.body.phone : "Korisnik nije ostavio telefon"
      }<span/>
      <br />
      <h3><b>Komentar korisnika: ${
        req.body.comment ? req.body.comment : "Korisnik nije ostavio komentar"
      }</b><h3/>
      <br />
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Količina</th>
            <th>Cena</th>
            <th>Kataloski broj</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>
    `;
    const mailOptions = {
      from: "medanmilos1831@gmail.com",
      to: "srba3sp@gmail.com",
      subject: "Narudžba potvrđena",
      // text: "heloooo",
      html: htmlContent,
    };
    let info = await transporter.sendMail(mailOptions);

    console.log("naruciiiii", info);
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { productRouter };
