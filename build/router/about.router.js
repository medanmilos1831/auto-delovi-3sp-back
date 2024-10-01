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
exports.aboutRouter = void 0;
const express_1 = require("express");
const aboutStorage_1 = require("../multer/aboutStorage");
const filePath = "src/json/onama.json";
const fs = require("fs");
const aboutRouter = (0, express_1.Router)();
exports.aboutRouter = aboutRouter;
aboutRouter.post("/upload-about", aboutStorage_1.aboutUpload.single("file"), (req, res) => {
    res.send("ok");
});
aboutRouter.post("/about", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let aboutData = JSON.parse(jsonData);
        aboutData.headline = req.body.headline || aboutData.headline;
        aboutData.opis = req.body.opis || aboutData.opis;
        aboutData.items = req.body.items || aboutData.items;
        const updatedJsonData = JSON.stringify(aboutData, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(422).send("Nesto nije ok");
    }
}));
aboutRouter.get("/about", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let aboutData = JSON.parse(jsonData);
        res.send(aboutData);
    }
    catch (error) {
        res.status(422).send("Nesto nije ok");
    }
}));
