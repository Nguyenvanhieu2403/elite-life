import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Roles } from './roles.entity';
import { Permissions } from './permissions.entity';
import { EntityHelper } from 'src/utils/entity-helper';

@Entity("RolePermisions")
export default class RolePermissions extends EntityHelper<RolePermissions> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_RolePermisions" })
    Id: number;

    @Column({ type: 'integer', nullable: true })
    RoleId: number | null;

    @ManyToOne(_ => Roles, { nullable: true })
    @JoinColumn({ name: "RoleId", foreignKeyConstraintName: "FK_RolePermisions_Role" })
    Role: Partial<Roles>;

    @Column({ type: 'integer', nullable: true })
    PermissionId: number | null;

    @ManyToOne(_ => Permissions, { nullable: true })
    @JoinColumn({ name: "PermissionId", foreignKeyConstraintName: "FK_RolePermisions_Permission" })
    Permission: Partial<Permissions>;

}