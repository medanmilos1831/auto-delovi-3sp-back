import { Router } from "express";
import { Program } from "../models/Program";
import slugify from "slugify";
import { Category } from "../models/Category";
import { Kontakt } from "../models/Kontakt";

const kontaktRouter = Router();

kontaktRouter.post("/kontakt", async (req, res) => {
  const has = await Kontakt.count();
  if (has === 0) {
    await Kontakt.create({
      id: 1,
      ...req.body,
    });
  } else {
    await Kontakt.update(
      {
        ...req.body,
      },
      {
        where: {
          id: 1,
        },
      }
    );
  }
  res.send("ok");
});

kontaktRouter.get("/kontakt", async (req, res) => {
  const kontakt = await Kontakt.findOne({
    where: {
      id: 1,
    },
  });
  res.send(kontakt);
});

export { kontaktRouter };
