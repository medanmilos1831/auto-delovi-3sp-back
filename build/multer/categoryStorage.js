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
exports.uploadCategory = void 0;
const constants_1 = require("../constants");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "src/json/program.json";
function findCategoryBySlug(slug) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    for (const [programSlug, program] of Object.entries(jsonArray)) {
        for (const [categorySlug, category] of Object.entries(program.kategorije)) {
            if (categorySlug === slug) {
                return category; // Vraćamo pronađenu kategoriju
            }
        }
    }
    return null; // Ako kategorija nije pronađena
}
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/category/");
        return req;
    },
    filename: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const uniqueSuffix = req.body.slug;
        cb(null, uniqueSuffix + path.extname(file.originalname));
        const category = findCategoryBySlug(req.body.slug);
        if (category && category.imageName) {
            const oldFilePath = path.join(__dirname, "../../uploads/category", category.imageName);
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Error deleting old image:", err);
                }
                else {
                    console.log("Old image deleted successfully");
                }
            });
        }
        // Iteriramo kroz sve programe i kategorije da pronađemo kategorije sa zadatim slugom
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                if (category.slug === req.body.slug) {
                    category.imageName = uniqueSuffix + path.extname(file.originalname); // Ažuriramo imageName
                    category.image = `${constants_1.x.URL}/uploads/category/${uniqueSuffix + path.extname(file.originalname)}`;
                }
            });
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        return {};
    }),
});
const uploadCategory = multer({ storage: multerStorage });
exports.uploadCategory = uploadCategory;
