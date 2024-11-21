import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { EntityHelper } from 'src/utils/entity-helper';
import { OtherListTypeEnums } from 'src/utils/enums.utils';


@Entity("OtherLists")
export class OtherLists extends EntityHelper<OtherLists> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_OtherLists" })
    Id: number;

    @Column({ type: 'varchar', length: 255 })
    Type: OtherListTypeEnums;

    @Column({ type: 'varchar', length: 255, default: "" })
    Code: string;

    @Column({ type: 'varchar', length: 255, default: "" })
    Name: string;

    @Column({ type: 'integer', nullable: true })
    Number1: number | null;

    @Column({ type: 'integer', nullable: true })
    Number2: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    String1: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    String2: string | null;

    @Column({ type: 'varchar', nullable: true, length: 255, default: "" })
    Note: string;

    @Column({ type: 'integer', nullable: true, default: 999 })
    Ord: number;

    @Column("boolean", { nullable: true, default: true })
    IsPublic: boolean;

}
