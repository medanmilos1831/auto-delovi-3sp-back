const { x } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "../../json/onama.json";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/about/");
  },
  filename: (req, file, cb) => {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);

    if (jsonArray.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/about",
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

    const newImageName = "image" + path.extname(file.originalname);
    cb(null, newImageName);

    jsonArray.image = `${x.URL}/uploads/about/${newImageName}`;
    jsonArray.imageName = newImageName;

    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
  },
});

const aboutUpload = multer({ storage: multerStorage });

module.exports = aboutUpload;
