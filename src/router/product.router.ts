import { Router } from "express";
import { Program } from "../models/Program";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { ProductProgramCategory } from "../models/ProductProgramCategory";
import { ProgramCategory } from "../models/ProgramCategory";
import { sequelize } from "../db";
import slugify from "slugify";
import { uploadProduct } from "../multer/productStorage";
const nodemailer = require("nodemailer");

const productRouter = Router();

// GENERATOR
productRouter.post("/product-generator", async (req, res) => {
  let products: any = [];
  let arr = new Array(25).fill(null);
  arr.forEach((i, index) => {
    products.push({
      naziv: `product_${index}`,
      slug: slugify(`product_${index}`, {
        lower: true,
        strict: true,
      }),
      opis: "ops",
      cena: "111",
      publishStatus: "active",
    });
  });
  const productCreated = await Product.bulkCreate(products);
  const d = await ProgramCategory.findAll({
    where: {
      categoryId: 1,
      programId: 1,
    },
    raw: true,
  });
  const ids = d.map((i: any) => i.id);
  for (const product of productCreated) {
    // Dodavanje više programskih kategorija za svaki proizvod
    await product.$add("programCategory", [1, 2]);

    // Dodavanje pojedinačne kategorije za svaki proizvod
    await product.$add("categories", 1);
  }

  res.send("ok");
});
// END :: GENERATOR

// GENERATOR
productRouter.post("/drop", async (req, res) => {
  await sequelize.drop();
  await sequelize.sync({ force: true });

  res.send("ok");
});
// END :: GENERATOR

productRouter.post(
  "/uploads/product",
  uploadProduct.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

productRouter.post("/product", async (req, res) => {
  try {
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const w = await Product.findOne({
      where: {
        slug,
      },
    });
    if (w) {
      throw {
        code: 422,
        message: "vec postoji proizvod",
      };
    }
    const product = await Product.create({
      naziv: req.body.naziv ?? null,
      opis: req.body.opis ?? null,
      caption: req.body.caption ?? null,
      cena: req.body.cena ?? null,
      items: req.body.items ?? null,
      publishStatus: "active",
      slug: slugify(req.body.naziv, {
        lower: true,
        strict: true,
      }),
    });
    if (!product) {
      throw {
        code: 422,
        message: "nesto nije ok",
      };
    }
    const d = await ProgramCategory.findAll({
      where: {
        categoryId: req.body.categoryId,
        programId: req.body.programId,
      },
      raw: true,
    });
    const ids = d.map((i: any) => i.id);
    await product.$add("programCategory", ids);
    await product.$add("categories", req.body.categoryId);
    await product.$add("programs", req.body.programId);

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.put("/product/:id", async (req, res) => {
  try {
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const productFind = await Program.findOne({
      where: {
        slug: slug,
      },
    });
    if (productFind) {
      throw {
        code: 422,
        message: "vec postoji proizvod",
      };
    }
    await Product.update(
      {
        naziv: req.body.naziv,
        opis: req.body.opis,
        cena: req.body.cena,
        items: req.body.items,
        caption: req.body.caption,
        publishStatus: "active",
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    const programCategory = await ProgramCategory.findAll({
      where: {
        categoryId: req.body.categoryId,
        programId: req.body.programId,
      },
      attributes: {
        exclude: ["programId", "categoryId", "createdAt", "updatedAt"],
      },
      raw: true,
    });
    if (!programCategory) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    const idsToKeep = programCategory.map((i: any) => i.id);
    const t = await sequelize.transaction();
    const d = await ProductProgramCategory.findAll({
      where: {
        productId: req.params.id,
      },
      attributes: {
        exclude: ["programId", "categoryId", "createdAt", "updatedAt"],
      },
      raw: true,
    });

    try {
      for (const item of d) {
        if (!idsToKeep.includes(item.programCategoryId)) {
          await ProductProgramCategory.destroy({
            where: {
              id: item.id,
            },
            transaction: t,
          });
        }
      }
    } catch (error) {
      await t.rollback();
    }

    try {
      let r = d.map((i) => i.programCategoryId);
      for (const item of idsToKeep) {
        if (!r.includes(item)) {
          await ProductProgramCategory.create(
            {
              productId: req.params.id,
              programCategoryId: item,
            },
            {
              transaction: t,
            }
          );
        }
      }
    } catch (error) {
      await t.rollback();
    }

    await t.commit();

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.get("/product", async (req, res) => {
  try {
    const programs: any = await Product.findAll({
      include: [
        {
          model: ProgramCategory,
          include: [
            {
              model: Program,
              attributes: {
                exclude: ["createdAt", "updatedAt", "id"],
              },
            },
            {
              model: Category,
              attributes: {
                exclude: ["createdAt", "updatedAt", "id"],
              },
            },
          ],
          nested: true,
          through: {
            attributes: [],
          },
        },
      ],
      nest: true,
    });
    if (!programs) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    let parsedArray: any = programs.map((item: any) => {
      let categories: any = [];
      let programs: any = [];

      item.programCategory.forEach((pc: any) => {
        if (!categories.includes(pc.category.naziv)) {
          categories.push(pc.category.naziv);
        }
        if (!programs.includes(pc.program.naziv)) {
          programs.push(pc.program.naziv);
        }
      });

      return {
        id: item.id,
        naziv: item.naziv,
        publishStatus: item.publishStatus,
        slug: item.slug,
        image: item.image,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: categories,
        program: programs,
      };
    });
    res.send(parsedArray);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.put("/product-publish/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      throw {
        code: 500,
        message: "trazeni prozivod ne postoji",
      };
    }
    let publishStatus =
      product?.publishStatus === "active" ? "inactive" : "active";
    const productUpdatw = await Product.update(
      {
        publishStatus,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (!productUpdatw) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    res.send("ok");
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
    let p = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!p) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

productRouter.get("/get-product-by-slug/:slug", async (req, res) => {
  try {
    const response = await Product.findOne({
      where: {
        slug: req.params.slug,
      },
    });
    if (!response) {
      throw {
        code: 500,
        message: "nema tog proizvda",
      };
    }
    res.send(response);
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
    console.log("helloooooo", req.body);
    const items = req.body.products
      .map(
        (item: any) => `
      <tr>
        <td>${item.product.naziv}</td>
        <td>${item.qty}</td>
        <td>${item.product.cena}</td>
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
