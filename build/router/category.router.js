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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoute = void 0;
const express_1 = require("express");
const slugify_1 = __importDefault(require("slugify"));
const multer_1 = require("../multer");
const fs = require("fs");
const filePath = "src/json/program.json";
const categoryRoute = (0, express_1.Router)();
exports.categoryRoute = categoryRoute;
categoryRoute.post("/upload-category", multer_1.uploadCategory.single("file"), (req, res) => {
    res.send("ok");
});
categoryRoute.post("/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        let slug = (0, slugify_1.default)(req.body.naziv, {
            lower: true,
            strict: true,
        });
        function checkForKey(jsonObj, keyToCheck) {
            for (const key in jsonObj) {
                if (jsonObj[key].kategorije && jsonObj[key].kategorije[keyToCheck]) {
                    return true;
                }
            }
            return false;
        }
        const keyExists = checkForKey(jsonArray, slug);
        if (keyExists) {
            throw {
                code: 422,
                message: "vec postoji kategorija",
            };
        }
        const _a = req.body, { programId } = _a, rest = __rest(_a, ["programId"]);
        req.body.programId.forEach((i) => {
            jsonArray[i].kategorije[slug] = Object.assign(Object.assign(Object.assign(Object.assign({}, jsonArray[i].kategorije[slug]), { slug }), rest), { prozivodi: {}, image: null, imageName: null });
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
categoryRoute.put("/category/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const { naziv, caption, desc, programId } = req.body;
        const oldCategoryId = req.params.id;
        // Generisanje sluga iz naziva
        const newCategorySlug = (0, slugify_1.default)(naziv, {
            lower: true,
            strict: true,
        });
        // Provera da li je naziv kategorije promenjen
        let isNameChanged = false;
        let currentCategory = null;
        // Iteriramo kroz sve programe i kategorije da pronađemo trenutnu kategoriju
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                if (categorySlug === oldCategoryId) {
                    currentCategory = category;
                    if (category.naziv !== naziv) {
                        isNameChanged = true;
                    }
                }
            });
        });
        if (!currentCategory) {
            throw new Error("Category not found");
        }
        // Provera da li novi naziv već postoji ako je naziv promenjen
        if (isNameChanged) {
            let nameExists = false;
            Object.entries(jsonArray).forEach(([programSlug, program]) => {
                Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                    if (categorySlug === newCategorySlug) {
                        nameExists = true;
                    }
                });
            });
            if (nameExists) {
                throw new Error("Category slug already exists");
            }
            // Ako je naziv promenjen, ažuriramo naziv u kategorijama
            Object.entries(jsonArray).forEach(([programSlug, program]) => {
                if (program.kategorije[oldCategoryId]) {
                    const categoryData = Object.assign({}, program.kategorije[oldCategoryId]);
                    delete program.kategorije[oldCategoryId];
                    program.kategorije[newCategorySlug] = categoryData;
                }
            });
        }
        // Ažuriramo informacije o kategoriji
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            if (program.kategorije[newCategorySlug]) {
                program.kategorije[newCategorySlug] = Object.assign(Object.assign({}, program.kategorije[newCategorySlug]), { naziv: naziv, caption: caption, desc: desc });
            }
        });
        // Prvo uklonimo kategoriju iz programa koji više nisu u listi programId
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            if (program.kategorije[newCategorySlug] &&
                !programId.includes(programSlug)) {
                delete program.kategorije[newCategorySlug];
            }
        });
        // Dodamo kategoriju u nove programe iz liste programId
        programId.forEach((newProgramSlug) => {
            if (jsonArray[newProgramSlug]) {
                jsonArray[newProgramSlug].kategorije[newCategorySlug] = {
                    slug: newCategorySlug,
                    naziv: naziv,
                    caption: caption,
                    desc: desc,
                    prozivodi: currentCategory.prozivodi || {},
                    imageName: currentCategory.imageName,
                    image: currentCategory.image,
                };
            }
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
categoryRoute.delete("/category/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            if (program.kategorije && program.kategorije[req.params.id]) {
                delete program.kategorije[req.params.id];
            }
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
categoryRoute.get("/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        function extractUniqueCategoriesWithProgram(jsonData) {
            const uniqueCategories = [];
            // Funkcija za kopiranje objekta bez prozivodi polja
            function copyWithoutProducts(obj) {
                const { prozivodi } = obj, rest = __rest(obj, ["prozivodi"]);
                return rest;
            }
            // Iteriramo kroz svaki program
            Object.entries(jsonData).forEach(([programSlug, program]) => {
                // Iteriramo kroz kategorije u svakom programu
                Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                    // Proveravamo da li kategorija već postoji u uniqueCategories po slug-u
                    const existingCategory = uniqueCategories.find((cat) => cat.slug === category.slug);
                    if (!existingCategory) {
                        // Ako kategorija ne postoji, dodajemo je u uniqueCategories
                        uniqueCategories.push(Object.assign(Object.assign({}, copyWithoutProducts(category)), { program: [{ value: program.slug, label: program.naziv }] }));
                    }
                    else {
                        // Ako kategorija već postoji, dodajemo { value: program.slug, label: program.naziv } u niz programa
                        existingCategory.program.push({
                            value: program.slug,
                            label: program.naziv,
                        });
                    }
                });
            });
            return uniqueCategories;
        }
        res.send(extractUniqueCategoriesWithProgram(jsonArray));
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
categoryRoute.get("/category/:program/:category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const program = jsonArray[req.params.program];
        if (!program) {
            return res.send({
                products: [],
                category: null,
            });
        }
        const cat = program.kategorije[req.params.category];
        if (!cat) {
            return res.send({
                products: [],
                category: null,
            });
        }
        return res.send(Object.assign({ products: Object.values(cat.prozivodi) }, (() => {
            const { prozivodi } = cat, rest = __rest(cat, ["prozivodi"]);
            return Object.assign({}, rest);
        })()));
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
