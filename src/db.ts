import { Sequelize } from "sequelize-typescript";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  port: 9000,
  database: "milos",
  username: "milos",
  password: "",
  logging: false,
  models: [__dirname + "/models"],
});
