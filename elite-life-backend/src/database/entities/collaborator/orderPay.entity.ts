import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { Collaborators } from "./collaborators.entity";
import { WalletTypeEnums } from "src/utils/enums.utils";
import { Products } from "../products.entity";
import { Orders } from "./order.entity";

@Entity("OrderPays",)
export class OrderPays extends EntityHelper<OrderPays> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_OrderPays" })
  Id: number;

  @Column("integer", { nullable: true })
  OrderId: number | null;

  @ManyToOne(_ => Orders, { nullable: true })
  @JoinColumn({ name: "OrderId", foreignKeyConstraintName: "FK_OrderPays_Order" })
  Order: Partial<Orders>;

  @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
  Value: number;

  @Column("varchar", { nullable: true })
  Note: string;

  @Column("timestamp", { nullable: true })
  PayDate: Date | null;
}
