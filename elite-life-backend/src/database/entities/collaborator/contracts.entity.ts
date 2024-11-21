import { EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Contracts",)
export class Contracts extends EntityHelper<Contracts> {
    @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Contracts" })
    Id: number;

    @Column("varchar", { nullable: true, length: 255 })
    UserName: string;

    @Column("varchar", { nullable: true, length: 255 })
    Name: string;

    @Column("varchar", { nullable: true })
    Identity: string;

    @Column("timestamp", { nullable: true })
    IdentityDate: Date | null;;

    @Column("varchar", { nullable: true })
    IdentityPlace: string;

    @Column("varchar", { nullable: true })
    Address: string;

    @Column("timestamp", { nullable: true })
    BeginDate: Date | null;

    @Column("boolean", { nullable: true, default: false })
    IsSign: boolean;

    @Column("varchar", { nullable: true })
    ImageSign: string;

}
