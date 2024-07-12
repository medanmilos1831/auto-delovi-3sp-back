import { Router } from "express";
import { Program } from "../models/Program";
import slugify from "slugify";
import { Category } from "../models/Category";
import { uploadProgram } from "../multer";
import { ProductProgram } from "../models/ProductProgram";
import { ProgramCategory } from "../models/ProgramCategory";
const fs = require("fs");
const path = require("path");

const programRouter = Router();

programRouter.post("/upload", uploadProgram.single("file"), (req, res) => {
  res.send("ok");
});

programRouter.post("/program", async (req, res) => {
  try {
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const w = await Program.findOne({
      where: {
        slug,
      },
    });
    if (w) {
      throw {
        code: 422,
        message: "vec postoji program",
      };
    }
    const program = await Program.create({
      ...req.body,
      slug,
    });
    if (!program) {
      throw {
        code: 422,
        message: "nesto nije ok",
      };
    }
    res.send("ok");
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.get("/program", async (req, res) => {
  try {
    const programs = await Program.findAll();
    if (!programs) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    res.send(programs);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

programRouter.delete("/program/:id", async (req, res) => {
  try {
    const programFindPro = await ProductProgram.count({
      where: {
        programId: req.params.id,
      },
    });
    if (programFindPro > 0) {
      throw {
        code: 422,
        message: "ne mozes obrisati program jer je vezan za proizode",
      };
    }
    const programFindCat = await ProgramCategory.count({
      where: {
        programId: req.params.id,
      },
    });
    if (programFindCat > 0) {
      throw {
        code: 422,
        message: "ne mozes obrisati program jer je vezan za kategoriju",
      };
    }

    const programFind = await Program.findOne({
      where: {
        id: req.params.id,
      },
    });

    const program = await Program.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (!program) {
      throw {
        code: 500,
        message: "nesto nije ok",
      };
    }
    if (programFind && programFind.imageName) {
      const imagePath = path.join(
        __dirname,
        "../../uploads/program",
        programFind?.imageName
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

programRouter.put("/program/:id", async (req, res) => {
  try {
    let slug = slugify(req.body.naziv, {
      lower: true,
      strict: true,
    });
    const programFind = await Program.findOne({
      where: {
        slug: slug,
      },
    });
    if (programFind!.id != (req.params.id as any)) {
      throw {
        code: 422,
        message: "vec postoji program",
      };
    }
    const program = await Program.update(
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
    if (!program) {
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

programRouter.get("/program/:program", async (req, res) => {
  try {
    const pr = await Program.findOne({
      where: {
        slug: req.params.program,
      },
    });
    if (!pr) {
      throw {
        code: 422,
        message: "Trazeni program nepostoji!",
      };
    }
    const categories = await Program.findAll({
      where: {
        slug: req.params.program,
      },
      include: [
        {
          model: Category,
          nested: true,
        },
      ],
      nest: true,
    });
    res.send(categories[0]);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { programRouter };
