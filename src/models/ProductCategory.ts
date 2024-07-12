import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Product } from "./Product";
import { Category } from "./Category";

@Table({
  timestamps: true,
  tableName: "productCategory",
  modelName: "ProductCategory",
})
export class ProductCategory extends Model {
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

  @ForeignKey(() => Category)
  @Column({
    type: DataType.NUMBER,
    allowNull: false,
  })
  categoryId: any;

  @BelongsTo(() => Product)
  product!: Product;
}
