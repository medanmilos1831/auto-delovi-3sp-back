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
exports.uploadProgram = void 0;
const constants_1 = require("../constants");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const filePath = "src/json/program.json";
// Funkcija za pronalaženje programa po slugu
function findProgramBySlug(slug) {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let jsonArray = JSON.parse(jsonData);
    // Iteriramo kroz sve programe da pronađemo program po slugu
    for (const [programSlug, program] of Object.entries(jsonArray)) {
        if (programSlug === slug) {
            return program; // Vraćamo pronađeni program
        }
    }
    return null; // Ako program nije pronađen
}
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/program/");
    },
    filename: (req, file, cb) => __awaiter(void 0, void 0, void 0, function* () {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const uniqueSuffix = req.body.slug;
        cb(null, uniqueSuffix + path.extname(file.originalname));
        const program = findProgramBySlug(req.body.slug);
        if (program && program.imageName) {
            const oldFilePath = path.join(__dirname, "../../uploads/program", program.imageName);
            fs.unlink(oldFilePath, (err) => {
                if (err) {
                    console.error("Error deleting old image:", err);
                }
                else {
                    console.log("Old image deleted successfully");
                }
            });
        }
        // Ažuriramo imageName i image za program
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            if (program.slug === req.body.slug) {
                program.imageName = uniqueSuffix + path.extname(file.originalname); // Ažuriramo imageName
                program.image = `${constants_1.x.URL}/uploads/program/${uniqueSuffix + path.extname(file.originalname)}`;
            }
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
    }),
});
const uploadProgram = multer({ storage: multerStorage });
exports.uploadProgram = uploadProgram;
