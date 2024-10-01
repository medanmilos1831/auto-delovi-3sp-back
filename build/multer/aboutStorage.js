"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aboutUpload = void 0;
const constants_1 = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "src/json/onama.json";
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/about/");
    },
    filename: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        if (jsonArray.imageName) {
            const oldFilePath = path.join(__dirname, "../../uploads/about", jsonArray.imageName);
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Error deleting old image:", err);
                }
                else {
                    console.log("Old image deleted successfully");
                }
            });
        }
        cb(null, "image" + path.extname(file.originalname));
        jsonArray.image =
            `${constants_1.x.URL}/uploads/about/image` + path.extname(file.originalname);
        jsonArray.imageName = `image${path.extname(file.originalname)}`;
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        return {};
    }),
});
const aboutUpload = multer({ storage: multerStorage });
exports.aboutUpload = aboutUpload;
