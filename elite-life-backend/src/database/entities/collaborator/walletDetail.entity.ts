import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { Collaborators } from "./collaborators.entity";
import { WalletTypeEnums } from "src/utils/enums.utils";
import { Wallets } from "./wallet.entity";

@Entity("WalletDetails",)
export class WalletDetails extends EntityHelper<WalletDetails> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_WalletDetails" })
  Id: number;

  @Column("integer", { nullable: true })
  WalletId: number | null;

  @ManyToOne(_ => Wallets, { nullable: true })
  @JoinColumn({ name: "WalletId", foreignKeyConstraintName: "FK_WalletDetails_Wallet" })
  Wallet: Partial<Wallets>;

  @Column("varchar", { nullable: true })
  WalletType: WalletTypeEnums;

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  Value: number;

  @Column("varchar", { nullable: true })
  Note: string;

  @Column("boolean", { nullable: true, default: false })
  IsAdmin: boolean;

}
