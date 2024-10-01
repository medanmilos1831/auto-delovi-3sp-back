const express = require("express");
const cors = require("cors");
// const { kontaktRouter, aboutRouter } = require("./router");
const programRouter = require("./router/program.router");
const categoryRoute = require("./router/category.router");
const productRouter = require("./router/product.router");
const pocetnaRouter = require("./router/pocetna.router");
const kontaktRouter = require("./router/kontakt.router");
const aboutRouter = require("./router/about.router");
const { x } = require("./constants");

const app = express();

app.use(cors());
app.use(express.json());

app.use(programRouter);
app.use(categoryRoute);
app.use(productRouter);
app.use(pocetnaRouter);
app.use(kontaktRouter);
app.use(aboutRouter);
app.use("/uploads", express.static("uploads"));

app.listen(x.PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${x.PORT}`);
});
