import { ColumnNumericTransformer, EntityHelper } from "src/utils/entity-helper";
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("Products",)
export class Products extends EntityHelper<Products> {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Products" })
  Id: number;

  @Column("varchar", { nullable: true })
  Name: string;

  @Column("numeric", { nullable: true, transformer: new ColumnNumericTransformer() })
  Price: number | null;

}
