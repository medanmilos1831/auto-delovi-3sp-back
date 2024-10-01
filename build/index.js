"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var cors = require("cors");
const router_1 = require("./router");
const constants_1 = require("./constants");
const app = (0, express_1.default)();
app.use(cors());
app.use(express_1.default.json());
app.use(router_1.programRouter);
app.use(router_1.categoryRoute);
app.use(router_1.productRouter);
app.use(router_1.pocetnaRouter);
app.use(router_1.kontaktRouter);
app.use(router_1.aboutRouter);
app.use("/uploads", express_1.default.static("uploads"));
app.listen(constants_1.x.PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${constants_1.x.PORT}`);
});
