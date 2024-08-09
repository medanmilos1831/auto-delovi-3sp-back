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
import { x } from "./constants";

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
