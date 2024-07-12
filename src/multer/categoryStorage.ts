import { Category } from "../models/Category";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/category/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const cat = await Category.findOne({ where: { id: req.body.id } });

    if (cat && cat.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/category",
        cat.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }
    const uniqueSuffix = req.body.id + "-" + req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));

    await Category.update(
      {
        image: `http://localhost:3000/uploads/category/${
          uniqueSuffix + path.extname(file.originalname)
        }`,
        imageName: uniqueSuffix + path.extname(file.originalname),
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    return {
      ...req.body,
      fileName: uniqueSuffix + path.extname(file.originalname),
    };
  },
});

const uploadCategory = multer({ storage: multerStorage });

export { uploadCategory };
