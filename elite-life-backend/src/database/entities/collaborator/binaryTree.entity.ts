import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

import { Banks } from "./banks.entity";
import { Exclude } from "class-transformer";
import { Collaborators } from "./collaborators.entity";
import { Orders } from "./order.entity";

@Entity("BinaryTrees",)
@Unique("UN_Order", ['OrderId'])
export class BinaryTrees extends EntityHelper<BinaryTrees> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_BinaryTrees" })
    Id: number;

    @Column("integer", { nullable: true })
    ParentId: number | null;

    @ManyToOne(_ => BinaryTrees, { nullable: true })
    @JoinColumn({ name: "ParentId", foreignKeyConstraintName: "FK_BinaryTrees_Parent" })
    Parent: Partial<BinaryTrees>;

    @Column("integer", { nullable: true })
    CollaboratorId: number | null;

    @ManyToOne(_ => Collaborators, { nullable: true })
    @JoinColumn({ name: "CollaboratorId", foreignKeyConstraintName: "FK_BinaryTrees_Collaborator" })
    Collaborator: Partial<Collaborators>;

    @Column("integer", { nullable: true })
    OrderId: number | null;

    @ManyToOne(_ => Orders, { nullable: true })
    @JoinColumn({ name: "OrderId", foreignKeyConstraintName: "FK_BinaryTrees_Order" })
    Order: Partial<Orders>;

}
