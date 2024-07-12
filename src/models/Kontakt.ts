import { Table, Column, DataType, Model } from "sequelize-typescript";

@Table({
  timestamps: true,
  tableName: "kontakt",
  modelName: "Kontakt",
})
export class Kontakt extends Model {
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
  facebook!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  instagram!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  adresa!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  coordinate!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  radnimDanima!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  subotom!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nedeljom!: string;
}
