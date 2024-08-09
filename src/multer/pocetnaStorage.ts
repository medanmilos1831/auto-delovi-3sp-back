import { x } from "../constants";

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "src/json/pocetna.json";

const multerStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "uploads/pocetna/");
  },
  filename: async (req: any, file: any, cb: any) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    if (jsonArray.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/pocetna",
        jsonArray.imageName
      );
      fs.unlink(oldFilePath, (err: any) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }

    cb(null, "image" + path.extname(file.originalname));

    jsonArray.image =
      `${x.URL}/uploads/pocetna/image` + path.extname(file.originalname);
    jsonArray.imageName = `image${path.extname(file.originalname)}`;
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
    return {};
  },
});

const uploadPocetna = multer({ storage: multerStorage });

export { uploadPocetna };
