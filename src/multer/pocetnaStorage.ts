import { Pocetna } from "../models/Pocetna";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/pocetna/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const pocetna = await Pocetna.findOne({ where: { id: 1 } });
    if (pocetna && pocetna.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/pocetna",
        pocetna.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }
    cb(null, "header" + path.extname(file.originalname));
    await Pocetna.update(
      {
        image:
          `http://localhost:3000/uploads/pocetna/header` +
          path.extname(file.originalname),
        imageName: `header${path.extname(file.originalname)}`,
      },
      {
        where: {
          id: 1,
        },
      }
    );
    return {
      ...req.body,
      fileName: "header" + path.extname(file.originalname),
    };
  },
});

const uploadPocetna = multer({ storage: multerStorage });

export { uploadPocetna };
