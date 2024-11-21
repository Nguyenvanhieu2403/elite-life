import { EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../user/users.entity";
import { ActionPermissionEnums, FunctionPermissionEnums, SaleStudentCommActionPermissionEnums, SaleStudentCommFunctionPermissionEnums } from "src/permissions/permission.enum";
import { Exclude } from "class-transformer";
import { ApplicationTypeEnums } from "src/utils/enums.utils";

@Entity("UserActivities",)
export class UserActivities extends EntityHelper<UserActivities> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_UserActivities" })
    Id: number;

    @Column("varchar", { default: null })
    Action: ActionPermissionEnums | SaleStudentCommActionPermissionEnums;

    @Column("varchar", { default: null })
    Function: FunctionPermissionEnums | SaleStudentCommFunctionPermissionEnums;

    @Column("integer", { nullable: true })
    UserId: number | null;

    @ManyToOne(_ => Users, { nullable: true })
    @JoinColumn({ name: "UserId", foreignKeyConstraintName: "PK_UserActivities_User" })
    User: Partial<Users>;

    @Column({ type: 'json', nullable: true })
    OldRequestData: any | null;

    @Column({ type: 'json', nullable: true })
    NewRequestData: any | null;

    @Column("varchar", { nullable: true, length: 1000 })
    Description: string | null;

    @Exclude({ toPlainOnly: true })
    @Column("varchar", { nullable: true })
    ApplicationType: ApplicationTypeEnums;

    @Column("integer", { nullable: true })
    RecordId: number | null;
}