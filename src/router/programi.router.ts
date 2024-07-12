import { Router } from "express";
import { programRouter } from "./program.router";
import { uploadProgrami } from "../multer";
import { sequelize } from "../db";
import { Programi } from "../models/Programi";
import { Program } from "../models/Program";

const programiRouter = Router();

programRouter.post(
  "/upload-programi",
  uploadProgrami.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

programiRouter.post("/programi", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const programi = await Programi.count();
    if (programi) {
      const x = await Programi.update(
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
      if (!x) {
        throw {
          code: 500,
          message: "nesto nije ok",
        };
      }
      await t.commit();
      return res.send("ok");
    }
    let r = await Programi.create(
      {
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
    await t.commit();
    return res.send("ok");
  } catch (error: any) {
    await t.rollback();
    res.status(error.code ?? 500).send(error.message);
  }
});

programiRouter.get("/programi", async (req, res) => {
  try {
    const pocetna = await Programi.findOne({
      where: {
        id: 1,
      },
      raw: true,
    });
    const programs = await Program.findAll();

    return res.send({
      headline: pocetna?.headline ?? null,
      desc: pocetna?.desc ?? null,
      imageName: pocetna?.imageName ?? null,
      image: pocetna?.image ?? null,
      programs: programs ?? [],
    });
  } catch (error: any) {
    res.status(error.code).send(error.message);
  }
});

export { programiRouter };
