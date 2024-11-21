import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";
import { EntityHelper } from "src/utils/entity-helper";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

@Entity("UserTokens",)
export class UserTokens extends EntityHelper<UserTokens>  {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_UserTokens" })
  Id: number;

  @Column("varchar", { nullable: true, default: "User" })
  ApplicationType: ApplicationTypeEnums;

  @Column("varchar", { nullable: true, length: 255 })
  UserName: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Email: string;

  @Column("integer", { nullable: true })
  Type: string;

  @Column("varchar", { nullable: true })
  Value: string | null;

  @Column("timestamp", { nullable: true })
  Exprired: Date | null;

  @Column("boolean", { nullable: true, default: false })
  IsUse: boolean;
}
