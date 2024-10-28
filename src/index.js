const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const programRouter = require("./router/program.router");
const categoryRoute = require("./router/category.router");
const productRouter = require("./router/product.router");
const pocetnaRouter = require("./router/pocetna.router");
const kontaktRouter = require("./router/kontakt.router");
const aboutRouter = require("./router/about.router");
const x = require("./constants");

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.sharedData = {
    kontakt: JSON.parse(
      fs.readFileSync(path.join(__dirname, "./../json/kontakt.json"), "utf8")
    ),
    onama: JSON.parse(
      fs.readFileSync(path.join(__dirname, "./../json/onama.json"), "utf8")
    ),
    pocetna: JSON.parse(
      fs.readFileSync(path.join(__dirname, "./../json/pocetna.json"), "utf8")
    ),
    program: JSON.parse(
      fs.readFileSync(path.join(__dirname, "./../json/program.json"), "utf8")
    ),
  };
  next();
});

app.use(programRouter);
app.use(categoryRoute);
app.use(productRouter);
app.use(pocetnaRouter);
app.use(kontaktRouter);
app.use(aboutRouter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(x.PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${x.PORT}`);
});
