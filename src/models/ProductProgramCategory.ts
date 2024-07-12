import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { ProgramCategory } from "./ProgramCategory";
import { Product } from "./Product";

@Table({
  timestamps: true,
  tableName: "productProgramCategory",
  modelName: "ProductProgramCategory",
})
export class ProductProgramCategory extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;
  @ForeignKey(() => ProgramCategory)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  programCategoryId: any;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  productId: any;
}
