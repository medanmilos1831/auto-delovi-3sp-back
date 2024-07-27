import { Programi } from "../models/Programi";
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/programi/");
    return req;
  },
  filename: async (req: any, file: any, cb: any) => {
    const programi = await Programi.findOne({ where: { id: 1 } });
    if (programi && programi.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/programi",
        programi.imageName
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
    await Programi.update(
      {
        image:
          `https://api.auto-delovi-3sp.com/uploads/programi/header` +
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

const uploadProgrami = multer({ storage: multerStorage });

export { uploadProgrami };
