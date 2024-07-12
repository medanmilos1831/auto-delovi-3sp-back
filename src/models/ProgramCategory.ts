import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Category } from "./Category";
import { Program } from "./Program";
import { Product } from "./Product";
import { ProductProgramCategory } from "./ProductProgramCategory";

@Table({
  timestamps: true,
  tableName: "programCategory",
  modelName: "ProgramCategory",
})
export class ProgramCategory extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;

  @ForeignKey(() => Program)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  programId: any;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  categoryId: any;

  @BelongsToMany(() => Product, {
    through: () => ProductProgramCategory,
    foreignKey: "programCategoryId",
    as: "product",
  })
  products: any;

  @BelongsTo(() => Program)
  program!: Program;

  @BelongsTo(() => Category)
  category!: Category;
}
