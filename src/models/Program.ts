import {
  Table,
  Column,
  DataType,
  Model,
  BelongsToMany,
} from "sequelize-typescript";
import slugify from "slugify";
import { Category } from "./Category";
import { ProgramCategory } from "./ProgramCategory";
import { Product } from "./Product";
import { ProductProgram } from "./ProductProgram";

@Table({
  timestamps: true,
  tableName: "program",
  modelName: "Program",
})
export class Program extends Model {
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
    type: DataType.STRING,
    allowNull: false,
  })
  naziv!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caption!: string;

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
  @BelongsToMany(() => Category, {
    through: () => ProgramCategory,
    foreignKey: "programId",
    as: "category",
  })
  categories: any;

  @BelongsToMany(() => Product, () => ProductProgram)
  products: any;
}
