import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Banks } from "./banks.entity";
import { Exclude } from "class-transformer";
import { RankEnums } from "src/utils/enums.utils";

@Entity("Collaborators",)
export class Collaborators extends EntityHelper<Collaborators> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Collaborators" })
    Id: number;

    @Column("varchar", { nullable: true, length: 255 })
    Name: string;

    @Column("varchar", { nullable: true, length: 255 })
    Email: string;

    @Column("varchar", { nullable: true, length: 255 })
    Mobile: string;

    @Column("varchar", { nullable: true })
    Address: string;

    @Column("varchar", { nullable: true })
    Identity: string;

    @Column("timestamp", { nullable: true })
    IdentityDate: Date | null;;

    @Column("varchar", { nullable: true })
    IdentityPlace: string;

    @Column("timestamp", { nullable: true })
    BeginDate: Date | null;

    @Column("integer", { nullable: true })
    Level: number | null;

    @Column("varchar", { nullable: true, default: RankEnums.None })
    Rank: RankEnums

    @Column("boolean", { nullable: true, default: false })
    IsSale: boolean;

    @Column("integer", { nullable: true })
    ParentId: number | null;

    @ManyToOne(_ => Collaborators, { nullable: true })
    @JoinColumn({ name: "ParentId", foreignKeyConstraintName: "FK_Collaborators_Parent" })
    Parent: Partial<Collaborators>;

    @Column("integer", { nullable: true })
    BankId: number | null;

    @ManyToOne(_ => Banks, { nullable: true })
    @JoinColumn({ name: "BankId", foreignKeyConstraintName: "FK_Collaborators_Bank" })
    Bank: Partial<Banks>;

    @Column("varchar", { nullable: true, length: 255 })
    BankBranchName: string;

    @Column("varchar", { nullable: true, length: 255 })
    BankOwner: string | null;

    @Column("varchar", { nullable: true, length: 255 })
    BankNumber: string | null;

    @Column("varchar", { nullable: true })
    Note: string | null;

    @Column("varchar", { nullable: true, length: 255 })
    UserName: string | null;

    @Exclude({ toPlainOnly: true })
    @Column("varchar", { nullable: true, length: 255 })
    Password: string | null;

    @Column("varchar", { nullable: true, length: 255 })
    NameSale: string;

    @Column("varchar", { nullable: true })
    AddressSale: string;

    @Column("varchar", { nullable: true, length: 255 })
    MobileSale: string;
}
