import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Roles } from "./roles.entity";
import { EntityHelper } from "src/utils/entity-helper";
import { ApplicationTypeEnums } from "src/utils/enums.utils";
import { Exclude } from "class-transformer";

@Entity("Users",)
export class Users extends EntityHelper<Users> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Users" })
  Id: number;

  @Column("varchar", { nullable: true, length: 255 })
  UserName: string | null;

  @Exclude({ toPlainOnly: true })
  @Column("varchar", { nullable: true, length: 255 })
  Password: string | null;

  @Column("integer", { nullable: true })
  RoleId: number | null;

  @ManyToOne(_ => Roles, { nullable: true })
  @JoinColumn({ name: "RoleId", foreignKeyConstraintName: "FK_Users_Role" })
  Role: Partial<Roles>;

  @Column("varchar", { nullable: true })
  DisplayName: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Email: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Mobile: string | null;

  @Column("varchar", { nullable: true, length: 255 })
  Address: string | null;

  @Column("varchar", { nullable: true })
  Permission: string | null;

  // @Exclude({ toPlainOnly: true })
  // @Column("boolean", { nullable: true, default: false })
  // IsLock: boolean;

  @Exclude({ toPlainOnly: true })
  @Column("varchar", { nullable: true, default: "User" })
  ApplicationType: ApplicationTypeEnums;

}
