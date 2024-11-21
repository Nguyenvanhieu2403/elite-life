import { EntityHelper } from "src/utils/entity-helper";
import { FileTypeEnums } from "src/utils/enums.utils";
import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("Files",)
export class Files extends EntityHelper<Files>  {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_Files" })
  Id: number;

  @Column("varchar", { nullable: true })
  Name: string;

  @Column("integer", { nullable: true })
  Type: FileTypeEnums;
}
