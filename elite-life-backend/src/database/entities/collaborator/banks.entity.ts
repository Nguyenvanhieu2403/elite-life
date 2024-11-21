import { EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OtherLists } from "../otherLists.entity";

@Entity("Banks",)
export class Banks extends EntityHelper<Banks> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Banks" })
  Id: number;

  @Column("varchar", { nullable: true })
  Name: string | null;

  @Column("integer", { nullable: true, default: 999 })
  OrderNo: number;
}
