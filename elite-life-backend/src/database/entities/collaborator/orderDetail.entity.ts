import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { Collaborators } from "./collaborators.entity";
import { WalletTypeEnums } from "src/utils/enums.utils";
import { Products } from "../products.entity";
import { Orders } from "./order.entity";

@Entity("OrderDetails",)
export class OrderDetails extends EntityHelper<OrderDetails> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_OrderDetails" })
  Id: number;

  @Column("integer", { nullable: true })
  OrderId: number | null;

  @ManyToOne(_ => Orders, { nullable: true })
  @JoinColumn({ name: "OrderId", foreignKeyConstraintName: "FK_OrderDetails_Order" })
  Order: Partial<Orders>;

  @Column("integer", { nullable: true })
  CollaboratorId: number | null;

  @ManyToOne(_ => Collaborators, { nullable: true })
  @JoinColumn({ name: "CollaboratorId", foreignKeyConstraintName: "FK_OrderDetails_Collaborator" })
  Collaborator: Partial<Collaborators>;

  @Column("varchar", { nullable: true, default: "User" })
  WalletTypeEnums: WalletTypeEnums;

  @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
  Value: number;

  @Column("varchar", { nullable: true })
  Note: string;
}
