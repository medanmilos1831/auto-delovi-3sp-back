import { Router } from "express";
import { Category } from "../models/Category";
import { Program } from "../models/Program";
import { ProgramCategory } from "../models/ProgramCategory";
import { Product } from "../models/Product";
import { sequelize } from "../db";
import { ProductProgramCategory } from "../models/ProductProgramCategory";
import slugify from "slugify";
import { uploadCategory } from "../multer";
import { ProductCategory } from "../models/ProductCategory";
const fs = require("fs");
const path = require("path");

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
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const w = await Category.findOne({
      where: {
        slug,
      },
    });
    if (w) {
      throw {
        code: 422,
        message: "vec postoji kategorija",
      };
    }
    const category = await Category.create({
      ...req.body,
      slug,
    });
    if (!category) {
      throw {
        code: 422,
        message: "nesto nije ok",
      };
    }
    category.$add("program", req.body.programId);
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.put("/category/:id", async (req, res) => {
  try {
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const categoryFind = await Category.findOne({
      where: {
        slug: slug,
      },
    });
    if (categoryFind!.id != (req.params.id as any)) {
      throw {
        code: 422,
        message: "vec postoji kategorija",
      };
    }
    const category = await Category.update(
      {
        ...req.body,
        slug: slugify(req.body.naziv, {
          lower: true,
          strict: true,
        }),
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    if (!category) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    const t = await sequelize.transaction();
    const existingRecords = await ProgramCategory.findAll({
      where: {
        categoryId: req.params.id,
      },
      transaction: t,
    });

    if (!existingRecords) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }

    const existingProgramCategoryIds = existingRecords.map(
      (record) => record.programId
    );
    const toRemove = existingProgramCategoryIds.filter(
      (id) => !req.body.programId.includes(id)
    );
    await ProgramCategory.destroy({
      where: {
        categoryId: req.params.id,
        programId: toRemove,
      },
      transaction: t,
    });
    for (let programCategoryId of req.body.programId) {
      if (!existingProgramCategoryIds.includes(programCategoryId)) {
        await ProgramCategory.create(
          {
            categoryId: req.params.id,
            programId: programCategoryId,
          },
          { transaction: t }
        );
      }
    }
    await t.commit();
    const products = await Product.findAll({
      include: {
        model: Category,
        where: {
          id: req.params.id,
        },
        through: {
          attributes: [],
        },
        attributes: [],
      },
      attributes: ["id"],
      nest: true,
      raw: true,
    });

    const nesto = await ProductProgramCategory.findAll({
      attributes: ["productId"],
      nest: true,
      raw: true,
    });

    const productIdsSet = new Set(nesto.map((item) => item.productId));
    const nonExistingIds = products
      .map((item) => item.id)
      .filter((id) => !productIdsSet.has(id));

    await Product.update(
      {
        publishStatus: "inactive",
      },
      {
        where: {
          id: nonExistingIds,
        },
      }
    );

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.delete("/category/:id", async (req, res) => {
  try {
    const categoryFindPro = await ProductCategory.count({
      where: {
        categoryId: req.params.id,
      },
    });
    if (categoryFindPro > 0) {
      throw {
        code: 422,
        message: "ne mozes obrisati kategoriju jer je vezan za proizode",
      };
    }
    const categoryFind = await Category.findOne({
      where: {
        id: req.params.id,
      },
    });
    const s = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!s) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    if (categoryFind && categoryFind.imageName) {
      const imagePath = path.join(
        __dirname,
        "../../uploads/category",
        categoryFind?.imageName
      );
      fs.unlink(imagePath, (err: any) => {
        if (err) {
          console.error("Error deleting image:", err);
        } else {
          console.log("Image deleted successfully");
        }
      });
    }

    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.get("/category", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: {
        model: Program,
        through: {
          attributes: [],
        },
      },
    });
    if (!categories) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    res.send(categories);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.get("/category-with-program", async (req, res) => {
  try {
    let response = await ProgramCategory.findAll({
      include: [{ model: Program }, { model: Category }],
      attributes: {
        exclude: ["programId", "categoryId", "createdAt", "updatedAt"],
      },
      nest: true,
      raw: true,
    });
    if (!response) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    res.send(response);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

categoryRoute.get("/category/:program/:category", async (req, res) => {
  try {
    const program = await Program.findOne({
      where: {
        slug: req.params.program,
      },
      raw: true,
    });
    if (!program) {
      throw {
        code: 422,
        message: "Trazeni program nepostoji!",
      };
    }
    const category: any = await Category.findOne({
      where: {
        slug: req.params.category,
      },
      raw: true,
    });
    if (!category) {
      throw {
        code: 422,
        message: "Trazena kategorija nepostoji!",
      };
    }
    const programCategory = await ProgramCategory.findAll({
      where: {
        programId: program!.id,
        categoryId: category!.id,
      },
      raw: true,
    });
    const productProgramCategory = await ProductProgramCategory.findAll({
      where: {
        programCategoryId: programCategory!.map((i: any) => i.id),
      },
    });
    const products: any = (await Product.findAll({
      where: {
        id: productProgramCategory!.map((i: any) => i.productId),
        publishStatus: "active",
      },
    })) as any;
    res.send({
      products,
      ...category,
    });
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { categoryRoute };
