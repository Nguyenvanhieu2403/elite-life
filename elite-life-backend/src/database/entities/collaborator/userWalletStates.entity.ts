import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("UserWalletStates")
export class UserWalletStates {
    @PrimaryGeneratedColumn({ name: "id", primaryKeyConstraintName: "PK_UserWalletStates" }) // Tên cột chính xác
  Id: number;

  @Column("integer", { name: "userid", nullable: false }) // Khớp với tên cột trong DB
  UserId: number;

  @Column("varchar", { name: "wallettype", nullable: false, length: 50 })
  WalletType: string;

  @Column("varchar", { name: "status", nullable: false, length: 20 })
  Status: string;

  @Column("timestamp", { name: "createdat", nullable: false, default: () => "CURRENT_TIMESTAMP" })
  CreatedAt: Date;

  @Column("timestamp", {
    name: "updatedat",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  UpdatedAt: Date;
}
