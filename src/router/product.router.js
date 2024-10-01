const { Router } = require("express");
const slugify = require("slugify"); // Use require for consistency
const uploadProduct = require("../multer/productStorage");
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
    if (
      jsonArray[req.body.programId].kategorije[req.body.categoryId.value]
        .prozivodi[req.body.naziv]
    ) {
      throw {
        code: 422,
        message: "vec postoji proizvod",
      };
    }
    jsonArray[req.body.programId].kategorije[
      req.body.categoryId.value
    ].prozivodi = {
      ...jsonArray[req.body.programId].kategorije[req.body.categoryId.value]
        .prozivodi,
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
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    res.status(422).send(error.message);
  }
});

productRouter.put("/product/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    const {
      naziv,
      caption,
      cena,
      opis,
      categoryId,
      programId,
      items,
      kataloski_broj,
    } = req.body;

    const productId = req.params.id;

    const removeProductFromCategory = (program, category) => {
      const categoryObj = jsonArray[program]?.kategorije[category];
      if (categoryObj && categoryObj.prozivodi[productId]) {
        delete categoryObj.prozivodi[productId];
      }
    };

    Object.keys(jsonArray).forEach((program) => {
      Object.keys(jsonArray[program].kategorije).forEach((category) => {
        removeProductFromCategory(program, category);
      });
    });

    if (!jsonArray[programId].kategorije[categoryId.value]) {
      jsonArray[programId].kategorije[categoryId.value] = {
        slug: categoryId.value,
        naziv: categoryId.label,
        prozivodi: {},
        image: null,
        imageName: null,
      };
    }

    jsonArray[programId].kategorije[categoryId.value].prozivodi[productId] = {
      naziv,
      opis,
      caption,
      cena,
      kataloski_broj,
      image: null,
      imageName: null,
      items,
      slug: naziv,
    };

    fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2), "utf8");

    res.status(200).send("Proizvod je uspešno premešten.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

productRouter.get("/product", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const uniqueProducts = [];
    const seenProducts = new Map();

    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      if (program && program.kategorije) {
        Object.entries(program.kategorije).forEach(
          ([categorySlug, category]) => {
            if (category && category.prozivodi) {
              Object.entries(category.prozivodi).forEach(
                ([productSlug, product]) => {
                  const productKey = product.slug;

                  if (!seenProducts.has(productKey)) {
                    seenProducts.set(productKey, {
                      ...product,
                      programs: [{ value: programSlug, label: program.naziv }],
                      categories: [
                        { value: category.slug, label: category.naziv },
                      ],
                    });
                  } else {
                    const existingProduct = seenProducts.get(productKey);
                    if (existingProduct) {
                      existingProduct.programs.push({
                        value: programSlug,
                        label: program.naziv,
                      });
                    }
                    const newCategory = {
                      value: category.slug,
                      label: category.naziv,
                    };
                    if (
                      !existingProduct.categories.find(
                        (cat) => cat.value === newCategory.value
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
    });

    seenProducts.forEach((product) => {
      uniqueProducts.push(product);
    });

    res.send(uniqueProducts);
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

productRouter.delete("/product/:id", async (req, res) => {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    const productIdToDelete = req.params.id;

    Object.entries(jsonArray).forEach(([programSlug, program]) => {
      Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
        if (category.prozivodi && category.prozivodi[productIdToDelete]) {
          delete category.prozivodi[productIdToDelete];
        }
      });
    });

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(updatedJsonData, "utf8");
    res.send("Product deleted successfully");
  } catch (error) {
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
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

productRouter.post("/naruci", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "srba3sp@gmail.com",
        pass: "pdoy mngj pzwz gcpn",
      },
    });
    const formatter = new Intl.NumberFormat("sr-RS", {
      style: "currency",
      currency: "RSD",
    });
    const items = req.body.products
      .map(
        (item) => `
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
      from: req.body.email,
      to: "srba3sp@gmail.com",
      subject: `Nova narudžba od ${req.body.name}`,
      html: htmlContent,
    };
    await transporter.sendMail(mailOptions);
    return res.send("Narudžba uspešno poslana!");
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Došlo je do greške prilikom slanja narudžbe.");
  }
});

module.exports = productRouter;
