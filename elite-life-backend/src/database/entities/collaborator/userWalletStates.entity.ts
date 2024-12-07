import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("UserWalletStates")
export class UserWalletStates {
    @PrimaryGeneratedColumn("increment", { primaryKeyConstraintName: "PK_UserWalletStates" })
    Id: number;

    @Column("integer", { nullable: false })
    UserId: number; // ID của User thực hiện giao dịch

    @Column("varchar", { nullable: false, length: 50 })
    WalletType: string; // Loại ví (ví dụ: Sale1, Sale2)

    @Column("varchar", { nullable: false, length: 20 })
    Status: string; // Trạng thái ("Pending" hoặc "Done")

    @Column("timestamp", { nullable: false, default: () => "CURRENT_TIMESTAMP" })
    CreatedAt: Date; // Thời gian tạo

    @Column("timestamp", { nullable: false, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    UpdatedAt: Date; // Thời gian cập nhật
}
