import { Column, Entity, Index, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Permissions } from "./permissions.entity";
import RolePermisions from "./rolePermisions.entity";
import { EntityHelper } from "src/utils/entity-helper";
import { Exclude } from "class-transformer";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

@Entity("Roles")
export class Roles extends EntityHelper<Roles> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Roles" })
  Id: number;

  @Column("varchar", { nullable: true, length: 255 })
  Name: string | null;

  @Column("varchar", { nullable: true })
  Permission: string | null;

  @OneToMany(
    _ => RolePermisions,
    (_) => _.Role,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      cascade: true,
      nullable: true,
    }
  )
  Permissions: Partial<RolePermisions>[];

  @Exclude({ toPlainOnly: true })
  @Column("varchar", { nullable: true, default: "User" })
  ApplicationType: ApplicationTypeEnums;

}
