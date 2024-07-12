import { About } from "../models/About";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/about/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const about = await About.findOne({ where: { id: 1 } });
    if (about && about.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/about",
        about.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully 1");
        }
      });
    }
    cb(null, "image" + path.extname(file.originalname));
    if (!about) {
      await About.create({
        id: 1,
        image:
          `http://localhost:3000/uploads/about/image` +
          path.extname(file.originalname),
        imageName: `image${path.extname(file.originalname)}`,
      });
    } else {
      await About.update(
        {
          image:
            `http://localhost:3000/uploads/about/image` +
            path.extname(file.originalname),
          imageName: `image${path.extname(file.originalname)}`,
        },
        {
          where: {
            id: 1,
          },
        }
      );
    }
    return {
      ...req.body,
      fileName: "header" + path.extname(file.originalname),
    };
  },
});

const aboutUpload = multer({ storage: multerStorage });

export { aboutUpload };
