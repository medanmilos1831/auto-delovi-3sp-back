import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Program } from "./Program";
import { Product } from "./Product";

@Table({
  timestamps: true,
  tableName: "productProgram",
  modelName: "ProductProgram",
})
export class ProductProgram extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;
  @ForeignKey(() => Product)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  productId: any;

  @ForeignKey(() => Program)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  programId: any;
}
