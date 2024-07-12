import { DataTypes, JSONB } from "sequelize";
import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
  timestamps: true,
  tableName: "about",
  modelName: "About",
})
export class About extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: false,
    primaryKey: true,
  })
  id!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  headline!: string;

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
    type: DataType.TEXT,
    allowNull: true,
  })
  opis!: string;

  @Column({
    type: JSONB,
    allowNull: true,
  })
  items!: string;
}
