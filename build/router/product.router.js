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
exports.productRouter = void 0;
const express_1 = require("express");
const slugify_1 = __importDefault(require("slugify"));
const productStorage_1 = require("../multer/productStorage");
const nodemailer = require("nodemailer");
const fs = require("fs");
const filePath = "src/json/program.json";
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
productRouter.post("/uploads/product", productStorage_1.uploadProduct.single("file"), (req, res) => {
    res.send("ok");
});
productRouter.post("/product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        let slug = (0, slugify_1.default)(req.body.naziv, {
            lower: true,
            strict: true,
        });
        if (jsonArray[req.body.programId].kategorije[req.body.categoryId.value]
            .prozivodi[req.body.naziv]) {
            throw {
                code: 422,
                message: "vec postoji proizvod",
            };
        }
        jsonArray[req.body.programId].kategorije[req.body.categoryId.value].prozivodi = Object.assign(Object.assign({}, jsonArray[req.body.programId].kategorije[req.body.categoryId.value]
            .prozivodi), { [slug]: {
                naziv: (_a = req.body.naziv) !== null && _a !== void 0 ? _a : null,
                opis: (_b = req.body.opis) !== null && _b !== void 0 ? _b : null,
                caption: (_c = req.body.caption) !== null && _c !== void 0 ? _c : null,
                cena: (_d = req.body.cena) !== null && _d !== void 0 ? _d : null,
                kataloski_broj: (_e = req.body.kataloski_broj) !== null && _e !== void 0 ? _e : null,
                image: null,
                imageName: null,
                items: (_f = req.body.items) !== null && _f !== void 0 ? _f : null,
                slug: (0, slugify_1.default)(req.body.naziv, {
                    lower: true,
                    strict: true,
                }),
            } });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("ok");
    }
    catch (error) {
        res.status(422).send(error.message);
    }
}));
productRouter.put("/product/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("re", req.body);
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const { naziv, caption, cena, opis, categoryId, programId, items, kataloski_broj, } = req.body;
        const productId = req.params.id;
        // Funkcija za pronalaženje i brisanje proizvoda iz stare kategorije i programa
        const removeProductFromCategory = (program, category) => {
            var _a;
            const categoryObj = (_a = jsonArray[program]) === null || _a === void 0 ? void 0 : _a.kategorije[category];
            if (categoryObj && categoryObj.prozivodi[productId]) {
                delete categoryObj.prozivodi[productId];
            }
        };
        // Prolazimo kroz sve programe i kategorije da pronađemo i obrišemo proizvod
        Object.keys(jsonArray).forEach((program) => {
            Object.keys(jsonArray[program].kategorije).forEach((category) => {
                removeProductFromCategory(program, category);
            });
        });
        // Provera da li kategorija postoji u ciljanom programu, ako ne, kreiramo je
        if (!jsonArray[programId].kategorije[categoryId.value]) {
            jsonArray[programId].kategorije[categoryId.value] = {
                slug: categoryId.value,
                naziv: categoryId.label,
                prozivodi: {},
                image: null,
                imageName: null,
            };
        }
        // Dodajemo proizvod u novu kategoriju
        jsonArray[programId].kategorije[categoryId.value].prozivodi[productId] = {
            naziv,
            opis,
            caption,
            cena,
            kataloski_broj,
            image: null,
            imageName: null,
            items,
            slug: naziv,
        };
        // Sačuvaj izmene u JSON fajl
        fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2), "utf8");
        res.status(200).send("Proizvod je uspešno premešten.");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
productRouter.get("/product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const uniqueProducts = [];
        const seenProducts = new Map(); // Mapa za praćenje jedinstvenih proizvoda na osnovu sluga
        // Iteriramo kroz sve programe u jsonData
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            if (program && program.kategorije) {
                // Iteriramo kroz sve kategorije u programu
                Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                    if (category && category.prozivodi) {
                        // Iteriramo kroz sve proizvode u kategoriji
                        Object.entries(category.prozivodi).forEach(([productSlug, product]) => {
                            const productKey = product.slug; // Koristimo slug kao jedinstveni ključ
                            // Ako proizvod nije već viđen, dodajemo ga u mapu seenProducts
                            if (!seenProducts.has(productKey)) {
                                seenProducts.set(productKey, Object.assign(Object.assign({}, product), { programs: [
                                        { value: programSlug, label: program.naziv },
                                    ], categories: [
                                        { value: category.slug, label: category.naziv },
                                    ] }));
                            }
                            else {
                                // Ako proizvod već postoji, dodajemo programSlug u listu 'programs'
                                const existingProduct = seenProducts.get(productKey);
                                if (existingProduct) {
                                    existingProduct.programs.push({
                                        value: programSlug,
                                        label: program.naziv,
                                    });
                                }
                                // Dodajemo kategoriju u novom formatu ako već nije prisutna za ovaj proizvod
                                const newCategory = {
                                    value: category.slug,
                                    label: category.naziv,
                                };
                                if (!existingProduct.categories.find((cat) => cat.value === newCategory.value)) {
                                    existingProduct.categories.push(newCategory);
                                }
                            }
                        });
                    }
                });
            }
        });
        seenProducts.forEach((product) => {
            uniqueProducts.push(product);
        });
        res.send(uniqueProducts);
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
productRouter.delete("/product/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const productIdToDelete = req.params.id;
        Object.entries(jsonArray).forEach(([programSlug, program]) => {
            Object.entries(program.kategorije).forEach(([categorySlug, category]) => {
                if (category.prozivodi && category.prozivodi[productIdToDelete]) {
                    delete category.prozivodi[productIdToDelete];
                }
            });
        });
        const updatedJsonData = JSON.stringify(jsonArray, null, 2);
        fs.writeFileSync(filePath, updatedJsonData, "utf8");
        res.send("Product deleted successfully");
    }
    catch (error) {
        res.status(500).send(error.message);
    }
}));
productRouter.get("/product/:program/:category/:product", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jsonData = fs.readFileSync(filePath, "utf8");
        let jsonArray = JSON.parse(jsonData);
        const program = jsonArray[req.params.program];
        if (!program) {
            throw {
                code: 500,
                message: "nema tog proizvda",
            };
        }
        const cat = program.kategorije[req.params.category];
        if (!cat) {
            throw {
                code: 500,
                message: "nema tog proizvda",
            };
        }
        if (!cat.prozivodi[req.params.product]) {
            throw {
                code: 500,
                message: "nema tog proizvda",
            };
        }
        return res.send(cat.prozivodi[req.params.product]);
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
productRouter.post("/naruci", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "srba3sp@gmail.com",
                pass: "pdoy mngj pzwz gcpn",
            },
        });
        const formatter = new Intl.NumberFormat("sr-RS", {
            style: "currency",
            currency: "RSD",
        });
        const items = req.body.products
            .map((item) => `
      <tr>
        <td>${item.product.naziv}</td>
        <td>${item.qty}</td>
        <td>${formatter.format(item.product.cena)}</td>
        <td>${item.product.kataloski_broj}</td>
      </tr>
    `)
            .join("");
        const htmlContent = `
      <p>Detalji narudžbe su prikazani ispod:</p>
      <span>Kontakt mail: ${req.body.email ? req.body.email : "Korisnik nije ostavio email"}<span/>
      <br />
      <span>Kontakt telefon: ${req.body.phone ? req.body.phone : "Korisnik nije ostavio telefon"}<span/>
      <br />
      <h3><b>Komentar korisnika: ${req.body.comment ? req.body.comment : "Korisnik nije ostavio komentar"}</b><h3/>
      <br />
      <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
        <thead>
          <tr>
            <th>Proizvod</th>
            <th>Količina</th>
            <th>Cena</th>
            <th>Kataloski broj</th>
          </tr>
        </thead>
        <tbody>
          ${items}
        </tbody>
      </table>
    `;
        const mailOptions = {
            from: "medanmilos1831@gmail.com",
            to: "srba3sp@gmail.com",
            subject: "Narudžba potvrđena",
            html: htmlContent,
        };
        yield transporter.sendMail(mailOptions);
        res.send("ok");
    }
    catch (error) {
        res.status(error.code).send(error.message);
    }
}));
