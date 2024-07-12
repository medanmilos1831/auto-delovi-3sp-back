import {
  Table,
  Column,
  DataType,
  Model,
  BelongsToMany,
} from "sequelize-typescript";
import { ProgramCategory } from "./ProgramCategory";
import { Program } from "./Program";
import { ProductCategory } from "./ProductCategory";
import { Product } from "./Product";

@Table({
  timestamps: true,
  tableName: "category",
  modelName: "Category",
})
export class Category extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  desc!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  caption!: string;

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
  naziv!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  slug!: string;

  @BelongsToMany(() => Program, {
    through: () => ProgramCategory,
    foreignKey: "categoryId",
    as: "program",
  })
  programs: any;

  @BelongsToMany(() => Product, () => ProductCategory)
  products: any;
}
