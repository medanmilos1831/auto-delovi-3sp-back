import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
  timestamps: true,
  tableName: "Pocetna",
  modelName: "Pocetna",
})
export class Pocetna extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id!: number;
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  headline!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  desc!: string;

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
}
