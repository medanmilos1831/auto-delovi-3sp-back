import express from "express";
var cors = require("cors");
import { sequelize } from "./db";
import {
  programRouter,
  categoryRoute,
  productRouter,
  pocetnaRouter,
  kontaktRouter,
  aboutRouter,
  // programiRouter,
} from "./router";
// import { About } from "./models/About";

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
// app.use(programiRouter);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running helooooo at http://localhost:${PORT}`);
});

// sequelize.sync().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`);
//   });
// });
