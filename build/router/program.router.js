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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.programRouter = void 0;
const express_1 = require("express");
const slugify_1 = __importDefault(require("slugify"));
const multer_1 = require("../multer");
const fs = require("fs");
const filePath = "src/json/program.json";
const programRouter = (0, express_1.Router)();
exports.programRouter = programRouter;
programRouter.post("/upload", multer_1.uploadProgram.single("file"), (req, res) => {
    res.send("ok");
});
programRouter.post("/program", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        let slug = (0, slugify_1.default)(req.body.naziv, {
            lower: true,
            strict: true,
        });
        if (jsonArray[slug]) {
            throw {
                code: 422,
                message: "vec postoji program",
            };
        }
        jsonArray[slug] = Object.assign(Object.assign({}, req.body), { slug, kategorije: {} });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
programRouter.get("/program", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        res.send(Object.keys(jsonArray).length === 0 ? [] : Object.values(jsonArray));
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
programRouter.delete("/program/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        delete jsonArray[req.params.id];
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
programRouter.put("/program/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        let slug = (0, slugify_1.default)(req.body.naziv, {
            lower: true,
            strict: true,
        });
        if (req.params.id != slug && jsonArray[slug]) {
            throw {
                code: 422,
                message: "vec postoji program",
            };
        }
        jsonArray[slug] = Object.assign(Object.assign(Object.assign({}, jsonArray[req.params.id]), { slug }), req.body);
        if (req.params.id != slug) {
            delete jsonArray[req.params.id];
        }
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
programRouter.get("/program/:program", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        let jsonArray = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (!jsonArray[req.params.program]) {
            return res.send([]);
        }
        const categories = [];
        // Iteriramo kroz sve programe u JSON objektu
        for (const programKey in jsonArray) {
            if (Object.hasOwnProperty.call(jsonArray, programKey)) {
                const program = jsonArray[programKey];
                // Iteriramo kroz sve kategorije u svakom programu
                for (const categoryKey in program.kategorije) {
                    if (Object.hasOwnProperty.call(program.kategorije, categoryKey)) {
                        const category = program.kategorije[categoryKey];
                        // Izvlačimo slug i naziv kategorije
                        const { slug, naziv, desc, caption, image, imageName } = category;
                        // Dodajemo kategoriju u listu sa slug-om i nazivom
                        categories.push({ slug, naziv, desc, caption, image, imageName });
                    }
                }
            }
        }
        res.send({
            naziv: (_b = (_a = jsonArray[req.params.program]) === null || _a === void 0 ? void 0 : _a.naziv) !== null && _b !== void 0 ? _b : null,
            caption: (_d = (_c = jsonArray[req.params.program]) === null || _c === void 0 ? void 0 : _c.caption) !== null && _d !== void 0 ? _d : null,
            desc: (_f = (_e = jsonArray[req.params.program]) === null || _e === void 0 ? void 0 : _e.desc) !== null && _f !== void 0 ? _f : null,
            image: (_h = (_g = jsonArray[req.params.program]) === null || _g === void 0 ? void 0 : _g.image) !== null && _h !== void 0 ? _h : null,
            imageName: (_k = (_j = jsonArray[req.params.program]) === null || _j === void 0 ? void 0 : _j.imageName) !== null && _k !== void 0 ? _k : null,
            category: (() => {
                if (!jsonArray[req.params.program].kategorije) {
                    return [];
                }
                return Object.values(jsonArray[req.params.program].kategorije);
            })(),
        });
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
