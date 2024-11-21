import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { Collaborators } from "./collaborators.entity";
import { WalletTypeEnums } from "src/utils/enums.utils";
import { Products } from "../products.entity";
import { OrderPays } from "./orderPay.entity";
import { OrderDetails } from "./orderDetail.entity";

@Entity("Orders",)
export class Orders extends EntityHelper<Orders> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Orders" })
  Id: number;

  @Column("integer", { nullable: true })
  CollaboratorId: number | null;

  @ManyToOne(_ => Collaborators, { nullable: true })
  @JoinColumn({ name: "CollaboratorId", foreignKeyConstraintName: "FK_Orders_Collaborator" })
  Collaborator: Partial<Collaborators>;

  @Column("integer", { nullable: true })
  ProductId: number | null;

  @ManyToOne(_ => Products, { nullable: true })
  @JoinColumn({ name: "ProductId", foreignKeyConstraintName: "FK_Orders_Product" })
  Product: Partial<Products>;

  @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
  Value: number;

  @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
  Pending: number;

  @Column("numeric", { default: 0, scale: 0, transformer: new ColumnNumericTransformer() })
  Payed: number;

  @Column("timestamp", { nullable: true })
  CompletedDate: Date | null;;

  @Column("boolean", { nullable: true, default: false })
  IsProcess: boolean;

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionExpected: number; // số trích dự kiến

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionReal: number; // số trích thực tế

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionCustomerMax: number; // mức hưởng tối đa của KH

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionCustomer: number; // mức đã hưởng

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionCustomerShare: number; // mức đã hưởng đồng chia

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionCustomerGratitude: number; // mức đã hưởng tri ân

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionSaleMax: number; // mức hưởng tối đa sale

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionSale: number; // mức đã hưởng

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionSale1: number; // mức hưởng quyền lợi 1

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionSale2: number; // mức hưởng quyền lợi 2 v1 --> v5 từ 0 --> 900%

  @Column("numeric", { default: 0, scale: 8, transformer: new ColumnNumericTransformer() })
  CommissionSale3: number; // mức hưởng từ 900% - 1000%

  @OneToMany(
    _ => OrderPays,
    (_) => _.Order,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
      nullable: true,
    }
  )
  OrderPays: Partial<OrderPays>[];

  @OneToMany(
    _ => OrderDetails,
    (_) => _.Order,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
      nullable: true,
    }
  )
  OrderDetails: Partial<OrderDetails>[];

  @Column("boolean", { nullable: true, default: false })
  IsDelivered: boolean;

  @Column("timestamp", { nullable: true })
  DeliveryDate: Date | null;

  @Column("varchar", { nullable: true, length: 255 })
  NameSale: string;

  @Column("varchar", { nullable: true })
  AddressSale: string;

  @Column("varchar", { nullable: true, length: 255 })
  MobileSale: string;
}
