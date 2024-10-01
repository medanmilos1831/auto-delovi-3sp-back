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
exports.kontaktRouter = void 0;
const express_1 = require("express");
const filePath = "src/json/kontakt.json";
const fs = require("fs");
const kontaktRouter = (0, express_1.Router)();
exports.kontaktRouter = kontaktRouter;
kontaktRouter.post("/kontakt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let aboutData = JSON.parse(jsonData);
        aboutData.facebook = (_a = req.body.facebook) !== null && _a !== void 0 ? _a : null;
        aboutData.instagram = (_b = req.body.instagram) !== null && _b !== void 0 ? _b : null;
        aboutData.phone = (_c = req.body.phone) !== null && _c !== void 0 ? _c : null;
        aboutData.email = (_d = req.body.email) !== null && _d !== void 0 ? _d : null;
        aboutData.adresa = (_e = req.body.adresa) !== null && _e !== void 0 ? _e : null;
        aboutData.coordinate = (_f = req.body.coordinate) !== null && _f !== void 0 ? _f : null;
        aboutData.radnimDanima = (_g = req.body.radnimDanima) !== null && _g !== void 0 ? _g : null;
        aboutData.subotom = (_h = req.body.subotom) !== null && _h !== void 0 ? _h : null;
        aboutData.nedeljom = (_j = req.body.nedeljom) !== null && _j !== void 0 ? _j : null;
        const updatedJsonData = JSON.stringify(aboutData, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
kontaktRouter.get("/kontakt", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jsonData = fs.readFileSync(filePath, "utf8");
    let aboutData = JSON.parse(jsonData);
    res.send(aboutData);
}));
