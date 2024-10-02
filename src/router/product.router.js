const { Router } = require("express");
const { URL } = require("../constants");
const uploadProduct = require("../multer/productStorage");
const nodemailer = require("nodemailer");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../json/program.json");

const productRouter = Router();

productRouter.post(
  "/uploads/product",
  uploadProduct.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

productRouter.get("/product", async (req, res) => {
  try {
    const jsonData = await fs.readFile(filePath, "utf8");
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

productRouter.get("/product/:program/:category/:product", async (req, res) => {
  try {
    const jsonData = await fs.read(filePath, "utf8");
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

productRouter.post("/sync", async (req, res) => {
  try {
    // Čitanje JSON fajla
    const jsonData = await fsSync.readFileSync(filePath, "utf8");
    const jsonObject = JSON.parse(jsonData);

    // Iteriranje kroz sve programe i kategorije
    Object.entries(jsonObject).forEach(async ([programSlug, program]) => {
      Object.entries(program.kategorije).forEach(
        async ([categorySlug, category]) => {
          Object.entries(category.prozivodi).forEach(
            async ([productSlug, product]) => {
              const id = product.id;
              if (id) {
                const potentialImagePath = path.join(
                  __dirname,
                  "../../uploads/product",
                  `${id}.jpg`
                );
                // console.log("potentialImagePath", potentialImagePath);

                if (fsSync.existsSync(potentialImagePath)) {
                  product.imageName = `${id}.jpg`;
                  product.image =
                    `${URL}${potentialImagePath}` + product.imageName;
                }
              }
            }
          );
        }
      );
    });

    const updatedJsonData = JSON.stringify(jsonObject, null, 2);
    fsSync.writeFileSync(filePath, updatedJsonData, "utf8");
    res.send("ok");
  } catch (error) {
    console.log("heheheheheh", error);
  }
});

module.exports = productRouter;
