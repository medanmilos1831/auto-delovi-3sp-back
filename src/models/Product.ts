import {
  Table,
  Column,
  DataType,
  Model,
  BelongsToMany,
} from "sequelize-typescript";
import { Category } from "./Category";
import { ProgramCategory } from "./ProgramCategory";
import { ProductProgram } from "./ProductProgram";
import { Program } from "./Program";
import { ProductCategory } from "./ProductCategory";
import { ProductProgramCategory } from "./ProductProgramCategory";
import { JSONB } from "sequelize";

@Table({
  timestamps: true,
  tableName: "product",
  modelName: "Product",
})
export class Product extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  naziv!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  publishStatus!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  opis!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  caption!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  cena!: string;

  @BelongsToMany(() => Program, () => ProductProgram)
  programs: any;

  @Column({
    type: JSONB,
    allowNull: true,
  })
  items!: string;

  @BelongsToMany(() => Category, () => ProductCategory)
  categories: any;

  @BelongsToMany(() => ProgramCategory, {
    through: () => ProductProgramCategory,
    foreignKey: "productId",
    as: "programCategory",
  })
  programCategories: any;
}
