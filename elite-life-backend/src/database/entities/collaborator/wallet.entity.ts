import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { Collaborators } from "./collaborators.entity";
import { WalletTypeEnums } from "src/utils/enums.utils";

@Entity("Wallets",)
@Unique(['CollaboratorId', 'WalletTypeEnums'])
export class Wallets extends EntityHelper<Wallets> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Wallets" })
  Id: number;

  @Column("integer", { nullable: true })
  CollaboratorId: number | null;

  @ManyToOne(_ => Collaborators, { nullable: true })
  @JoinColumn({ name: "CollaboratorId", foreignKeyConstraintName: "FK_Wallets_Collaborator" })
  Collaborator: Partial<Collaborators>;

  @Column("varchar", { nullable: true, default: "User" })
  WalletTypeEnums: WalletTypeEnums;

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  Available: number;

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  Pending: number;

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  Total: number; // sử dụng để biết tổng nạp/hoa hồng KH/hoa hồng sale được nhiêu
}
