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
exports.uploadProduct = void 0;
const constants_1 = require("../constants");
const filePath = "src/json/program.json";
const multer = require("multer");
const path = require("path");
const fs = require("fs");
function findProductBySlug(slug) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    // Iteriramo kroz sve programe i kategorije da pronađemo proizvod po slugu
    for (const [programSlug, program] of Object.entries(jsonArray)) {
        for (const [categorySlug, category] of Object.entries(program.kategorije)) {
            if (category.prozivodi && category.prozivodi[slug]) {
                return category.prozivodi[slug]; // Vraćamo pronađeni proizvod
            }
        }
    }
    return null; // Ako proizvod nije pronađen
}
function updateProductImageName(slug, imageName, image) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    // Iteriramo kroz sve programe i kategorije da pronađemo proizvode sa zadatim slugom
    Object.entries(jsonArray).forEach(([programSlug, program]) => {
        Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
            if (category.prozivodi && category.prozivodi[slug]) {
                category.prozivodi[slug].imageName = imageName; // Ažuriramo imageName
                category.prozivodi[slug].image = image;
            }
        });
    });
    const updatedJsonData = JSON.stringify(jsonArray, null, 2);
    fs.writeFileSync(filePath, updatedJsonData, "utf8");
}
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/product/");
        return req;
    },
    filename: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const uniqueSuffix = req.body.slug;
        cb(null, uniqueSuffix + path.extname(file.originalname));
        const product = findProductBySlug(req.body.slug);
        if (product && product.imageName) {
            const oldFilePath = path.join(__dirname, "../../uploads/product", product.imageName);
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Error deleting old image:", err);
                }
                else {
                    console.log("Old image deleted successfully");
                }
            });
        }
        updateProductImageName(req.body.slug, uniqueSuffix + path.extname(file.originalname), `${constants_1.x.URL}/uploads/product/${uniqueSuffix + path.extname(file.originalname)}`);
        return {};
    }),
});
const uploadProduct = multer({ storage: multerStorage });
exports.uploadProduct = uploadProduct;
