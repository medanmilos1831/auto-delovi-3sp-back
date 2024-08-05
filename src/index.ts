import express from "express";
var cors = require("cors");
import {
  programRouter,
  categoryRoute,
  productRouter,
  pocetnaRouter,
  kontaktRouter,
  aboutRouter,
} from "./router";

const app = express();

const PORT = 3000;
app.use(cors());
app.use(express.json());

app.use(programRouter);
app.use(categoryRoute);
app.use(productRouter);
app.use(pocetnaRouter);
app.use(kontaktRouter);
app.use(aboutRouter);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});
