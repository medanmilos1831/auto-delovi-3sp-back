import { Router } from "express";
import { About } from "../models/About";
import { sequelize } from "../db";
import { aboutUpload } from "../multer/aboutStorage";

const aboutRouter = Router();

aboutRouter.post("/upload-about", aboutUpload.single("file"), (req, res) => {
  res.send("ok");
});

aboutRouter.post("/about", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const has = await About.count();
    if (has === 0) {
      let r = await About.create(
        {
          id: 1,
          ...req.body,
        },
        {
          transaction: t,
        }
      );
      if (!r) {
        throw {
          code: 500,
          message: "nesto nije ok",
        };
      }
    } else {
      let y = await About.update(
        {
          ...req.body,
        },
        {
          where: {
            id: 1,
          },
          transaction: t,
        }
      );
      if (!y) {
        throw {
          code: 500,
          message: "nesto nije ok",
        };
      }
    }
    await t.commit();
    res.send("ok");
  } catch (error: any) {
    await t.rollback();
    res.status(error.code).send(error.message);
  }
});

aboutRouter.get("/about", async (req, res) => {
  try {
    const kontakt = await About.findOne({
      where: {
        id: 1,
      },
    });
    res.send(kontakt);
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { aboutRouter };
