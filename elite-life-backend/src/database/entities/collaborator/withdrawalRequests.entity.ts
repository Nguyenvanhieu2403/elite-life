import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Banks } from "./banks.entity";
import { WithdrawalStatusEnums } from "src/utils/enums.utils";
import { Collaborators } from "./collaborators.entity";

@Entity("WithdrawalRequests",)
export class WithdrawalRequests extends EntityHelper<WithdrawalRequests> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_WithdrawalRequests" })
    Id: number;

    @Column("varchar", { nullable: true, length: 255 })
    Code: string | null;

    @Column("integer", { nullable: true })
    CollaboratorId: number | null;

    @ManyToOne(_ => Collaborators, { nullable: true })
    @JoinColumn({ name: "CollaboratorId", foreignKeyConstraintName: "FK_WithdrawalRequests_Collaborator" })
    Collaborator: Partial<Collaborators>;

    @Column("varchar", { nullable: true, length: 255 })
    BankNumber: string | null;

    @Column("varchar", { nullable: true, length: 255 })
    BankOwner: string | null;

    @Column("integer", { nullable: true })
    BankId: number | null;

    @ManyToOne(_ => Banks, { nullable: true })
    @JoinColumn({ name: "BankId", foreignKeyConstraintName: "FK_WithdrawalRequests_Bank" })
    Bank: Partial<Banks>;

    @Column("varchar", { nullable: true, length: 255 })
    BankBranchName: string;

    @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
    WithdrawalAmount: number; // lưu số tiền rút

    @Column("varchar", { nullable: true })
    Note: string | null;

    @Column("varchar", { nullable: true })
    Status: WithdrawalStatusEnums;

    @Column("varchar", { nullable: true })
    NoteRejection: string | null;

    @Column("varchar", { nullable: true })
    Image: string;

    @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
    Tax: number

    @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
    ActualNumberReceived: number
}
