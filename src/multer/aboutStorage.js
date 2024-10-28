const { URL } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "../../json/onama.json";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/about/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const jsonArray = req.sharedData.onama;
    // const jsonData = fs.readFileSync(filePath, "utf8");
    // let jsonArray = JSON.parse(jsonData);

    if (jsonArray.imageName) {
      const oldFilePath = path.join(
        __dirname,
        "../../uploads/about/",
        jsonArray.imageName
      );
      fs.unlinkSync(oldFilePath);
    }

    const newImageName = "image" + path.extname(file.originalname);
    cb(null, newImageName);

    jsonArray.image = `${URL}/uploads/about/${newImageName}`;
    jsonArray.imageName = newImageName;
    req.sharedData.onama = jsonArray;
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(
      path.join(__dirname, "./../../json/onama.json"),
      updatedJsonData,
      "utf8"
    );
  },
});

const aboutUpload = multer({ storage: multerStorage });

module.exports = aboutUpload;
