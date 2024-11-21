import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Files } from "./files.entity";
import { EntityHelper } from "src/utils/entity-helper";
import { ApplicationTypeEnums, FileTypeEnums } from "src/utils/enums.utils";
import { Exclude } from "class-transformer";

@Entity("UploadFiles",)
export class UploadFiles extends EntityHelper<UploadFiles>  {
  @PrimaryGeneratedColumn('increment', { primaryKeyConstraintName: "PK_UploadFiles" })
  Id: number;

  @Column("integer", { nullable: true })
  ForId: number | null;

  @Column("integer", { nullable: true })
  FileId: number | null;

  @ManyToOne(_ => Files, { nullable: true })
  @JoinColumn({ name: "FileId", foreignKeyConstraintName: "FK_UploadFiles_File" })
  File: Partial<Files>;

  @Column("varchar", { nullable: true })
  FileName: string;

  @Column("integer", { nullable: true })
  Type: FileTypeEnums;

  @Column("boolean", { default: true })
  IsApproved: boolean;

}
