const { URL } = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../uploads/pocetna/");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const jsonArray = req.sharedData.pocetna;
    // const jsonData = fs.readFileSync(filePath, "utf8");
    // let jsonArray = JSON.parse(jsonData);
    console.log("jsonArray", jsonArray);

    // if (jsonArray.imageName) {
    //   const oldFilePath = path.join(
    //     __dirname,
    //     "../../uploads/pocetna/",
    //     jsonArray.imageName
    //   );
    //   if (oldFilePath) {
    //     console.log("eeee", oldFilePath);
    //     fs.unlinkSync(oldFilePath);
    //   }
    // }

    const newImageName = "image" + path.extname(file.originalname);
    cb(null, newImageName);

    jsonArray.image = `${URL}/uploads/pocetna/${newImageName}`;
    jsonArray.imageName = newImageName;
    req.sharedData.pocetna = jsonArray;
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(
      path.join(__dirname, "./../../json/pocetna.json"),
      updatedJsonData,
      "utf8"
    );
  },
});

const pocetnaUpload = multer({ storage: multerStorage });

module.exports = pocetnaUpload;
