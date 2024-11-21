import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { OtherLists } from "../otherLists.entity";
import { EntityHelper } from "src/utils/entity-helper";
import { Exclude } from "class-transformer";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

@Entity("Permissions",)
export class Permissions extends EntityHelper<Permissions> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Permissions" })
  Id: number;

  @Column("varchar", { nullable: true, length: 255 })
  Code: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Name: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Action: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Controller: string | null;

  @Exclude({ toPlainOnly: true })
  @Column("varchar", { nullable: true, default: "User" })
  ApplicationType: ApplicationTypeEnums;

}
