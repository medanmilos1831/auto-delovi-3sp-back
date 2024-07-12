import { Product } from "../models/Product";
import { Program } from "../models/Program";

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/product/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const uniqueSuffix = req.body.id + "-" + req.body.slug;
    cb(null, uniqueSuffix + path.extname(file.originalname));
    const product = await Product.findOne({ where: { id: req.body.id } });
    if (product && product.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/product",
        product.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }
    await Product.update(
      {
        image: `http://localhost:3000/uploads/product/${
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

const uploadProduct = multer({ storage: multerStorage });

export { uploadProduct };
