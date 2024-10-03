const { URL } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = path.join(__dirname, "../json/pocetna.json");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/pocetna/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    if (jsonArray.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../uploads/pocetna",
        jsonArray.imageName
      );
      fs.unlink(oldFilePath, (err) => {
        if (err) {
          console.error("Error deleting old image:", err);
        } else {
          console.log("Old image deleted successfully");
        }
      });
    }

    cb(null, "image" + path.extname(file.originalname));

    jsonArray.image =
      `${URL}/uploads/pocetna/image` + path.extname(file.originalname);
    jsonArray.imageName = `image${path.extname(file.originalname)}`;
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
  },
});

const uploadPocetna = multer({ storage: multerStorage });

module.exports = uploadPocetna;
