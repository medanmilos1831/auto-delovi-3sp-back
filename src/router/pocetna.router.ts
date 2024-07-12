import { Router } from "express";
import { Pocetna } from "../models/Pocetna";
import { programRouter } from "./program.router";
import { uploadPocetna } from "../multer";
import { sequelize } from "../db";
import { Program } from "../models/Program";

const pocetnaRouter = Router();

programRouter.post(
  "/upload-pocetna",
  uploadPocetna.single("file"),
  (req, res) => {
    res.send("ok");
  }
);

pocetnaRouter.post("/pocetna", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const pocetna = await Pocetna.count();
    if (pocetna) {
      const x = await Pocetna.update(
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
        console.log("ddddddddd", x);
        throw {
          code: 500,
          message: "nesto nije ok",
        };
      }
      await t.commit();
      return res.send("ok");
    }
    let r = await Pocetna.create(
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

pocetnaRouter.get("/pocetna", async (req, res) => {
  try {
    const pocetna = await Pocetna.findOne({
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

export { pocetnaRouter };
