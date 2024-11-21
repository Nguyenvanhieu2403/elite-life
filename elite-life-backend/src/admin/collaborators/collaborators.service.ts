import { Injectable } from '@nestjs/common';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { Repository, DataSource, FindManyOptions, DeepPartial, FindOneOptions, Raw, FindOptionsWhere, In, Not } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { BinaryCollaboratorDto, CreateCollaboratorDto, Record } from './dto/create-collaborator.dto';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApplicationTypeEnums, FileTypeEnums, RankEnums, WalletTypeEnums } from 'src/utils/enums.utils';
import { UsersService } from '../users/users.service';
import { UpdateCollaboratorDto } from './dto/update-collaborator.dto';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as path from 'path';
import { AllConfigType } from 'src/config/config.type';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { FileHelper } from 'src/utils/file-helper';
import { BanksService } from '../banks/banks.service';
import { UpdateBankDto } from './dto/update-collaborator-bank.dto';
import { GetTreeCollaboratorDto, GetTreeRawCollaboratorDto } from './dto/get-tree-collaborator.dto';
import { ImportCollaboratorDto } from './dto/import-collaborator.dto';
import { Users } from 'src/database/entities/user/users.entity';
import { StringToMd5 } from 'src/utils/common-helper';
import { CreateAvailableDepositDto } from './dto/create-collaborator-contractNumber.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { BinaryTrees } from 'src/database/entities/collaborator/binaryTree.entity';
import * as fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborators)
    private collaboratorRepository: Repository<Collaborators>,
    private readonly usersService: UsersService,
    private dataSource: DataSource,
    @InjectRepository(UploadFiles)
    private uploadFilesRepository: Repository<UploadFiles>,
    private configService: ConfigService<AllConfigType>,
    private bankService: BanksService,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(BinaryTrees)
    private binaryTreesRepository: Repository<BinaryTrees>,
  ) { }

  async find(options?: FindManyOptions<Collaborators>) {
    return await this.collaboratorRepository.find(options);
  }

  async exist(options?: FindManyOptions<Collaborators>) {
    return await this.collaboratorRepository.exist(options);
  }

  findManyWithPagination(options?: FindManyOptions<Collaborators>, paginationOptions?: IPaginationOptions,) {
    return this.collaboratorRepository.findAndCount({
      ...options,
      skip: paginationOptions ? (paginationOptions.page - 1) * paginationOptions.limit : null,
      take: paginationOptions ? paginationOptions.limit : null,
      order: {
        ...options.order,
        CreatedAt: "DESC"
      },

    });
  }

  async findOne(options: FindOneOptions<Collaborators>) {
    return await this.collaboratorRepository.findOne(options);
  }

  async create(createCollaboratorDto: CreateCollaboratorDto, user: JwtPayloadType) {
    var response: ResponseData = { status: false }
    var info = await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        ...createCollaboratorDto,
        CreatedBy: user.userName
      }),
    );

    info.UserName = `EL${String(info.Id).padStart(3, '0')}`
    await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        Id: info.Id,
        UserName: info.UserName,
        Rank: RankEnums.None
      }));

    if (createCollaboratorDto.File) {
      const fileExtension = createCollaboratorDto.File.originalname.split('.').pop();
      var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      // 20 is File Id in table UploadFiles
      const fileName = `${info.UserName}-20-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
      FileHelper.SaveFile(createCollaboratorDto.File, path.resolve(dirFile, "Files", "Collaborator"), fileName);
      await this.uploadFilesRepository.save(
        this.uploadFilesRepository.create({
          FileId: 20, // avatar
          FileName: fileName,
          ForId: info.Id,
          Type: FileTypeEnums.Sale,
          IsApproved: true,
          CreatedBy: user.userName
        })
      )
    }

    // process user
    let userInfo: CreateUserDto = {
      UserName: info.UserName,
      Password: createCollaboratorDto.Password,
      DisplayName: info.Name,
      Email: info.Email,
      Mobile: info.Mobile,
      Address: info.Address,
      ApplicationType: ApplicationTypeEnums.Sale
    }

    await this.usersService.create(userInfo, user)

    response.status = true;
    response.data = info;
    return response
  }

  async update(id: Collaborators["Id"], updateCollaboratorDto: UpdateCollaboratorDto, user: JwtPayloadType) {
    var response: ResponseData = { status: false }
    await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        Id: id,
        ...updateCollaboratorDto
      }),
    );
    let info = await this.collaboratorRepository.findOne({ where: { Id: id } });

    if (info && updateCollaboratorDto.File) {
      const fileExtension = updateCollaboratorDto.File.originalname.split('.').pop();
      var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      const fileName = `${info.UserName}-20-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
      FileHelper.SaveFile(updateCollaboratorDto.File, path.resolve(dirFile, "Files", "Collaborator"), fileName);
      await this.uploadFilesRepository.save(
        this.uploadFilesRepository.create({
          FileId: 20,
          FileName: fileName,
          ForId: info.Id,
          Type: FileTypeEnums.Sale,
          IsApproved: true,
          CreatedBy: user.userName
        })
      )
    }

    if (info) {
      let exist = await this.usersService.findOne({
        UserName: info.UserName,
        ApplicationType: ApplicationTypeEnums.Sale
      })

      if (exist == undefined) {
        let userInfo: CreateUserDto = {
          UserName: info.UserName,
          Password: updateCollaboratorDto.Password,
          DisplayName: info.Name,
          Email: info.Email,
          Mobile: info.Mobile,
          Address: info.Address,
          ApplicationType: ApplicationTypeEnums.Sale
        }

        await this.usersService.create(userInfo, user)
      }
      else
        await this.usersService.update(exist.Id, {
          DisplayName: info.Name,
          Email: info.Email,
          Mobile: info.Mobile,
          Address: info.Address,
        })
    }

    if (updateCollaboratorDto.Password) {
      let exist = await this.usersService.findOne({
        UserName: info.UserName,
        ApplicationType: ApplicationTypeEnums.Sale
      })

      if (exist == undefined) {
        let userInfo: CreateUserDto = {
          UserName: info.UserName,
          Password: updateCollaboratorDto.Password,
          DisplayName: info.Name,
          Email: info.Email,
          Mobile: info.Mobile,
          Address: info.Address,
          ApplicationType: ApplicationTypeEnums.Sale
        }

        await this.usersService.create(userInfo, user)
      }
      else
        await this.usersService.update(exist.Id, { Password: updateCollaboratorDto.Password })
    }

    response.status = true;
    return response
  }

  async remove(id: Collaborators["Id"]) {
    var response: ResponseData = { status: false }
    await this.collaboratorRepository.delete(id);
    response.status = true;
    return response
  }

  async softRemove(id: Collaborators["Id"]) {
    var response: ResponseData = { status: false }

    let collaborator = await this.collaboratorRepository.findOne({
      where: { Id: id },
      select: {
        Id: true,
        UserName: true,
      },
    })

    // if (collaborator.AvailableDeposit > 0) {
    //   response.message = {
    //     AvailableDeposit: "Không thể xoá vì người dùng còn tiền trong tài khoản!!"
    //   }
    //   return response

    // }

    let collaboratorList = await this.collaboratorList(collaborator.UserName)

    if (((collaboratorList).length - 1) != 0) {
      response.message = "Không thể xoá vì người dùng có người dưới hệ thống!!"
      return response
    }

    await this.usersRepository.softDelete({ UserName: collaborator.UserName, ApplicationType: ApplicationTypeEnums.Sale })
    await this.collaboratorRepository.softDelete(id);

    response.status = true;
    return response
  }

  async updateBank(id: Collaborators["Id"], updateBankDto: UpdateBankDto) {
    var response: ResponseData = { status: false }
    await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        Id: id,
        ...updateBankDto
      }),
    );
    response.status = true;
    return response
  }

  async collaboratorList(userName: string) {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });
    let dataRaw = await this.collaboratorRepository.query(
      `WITH RECURSIVE recursive_cte AS (
      SELECT c."Id", CASE WHEN c."Id" = c."ParentId" THEN NULL ELSE c."ParentId" END "ParentId", 1 "Level",
      ARRAY[c."Id"] "ListId",c."UserName"
      FROM  ${schema}."Collaborators" c
      WHERE c."UserName"  = $1
      UNION ALL
      SELECT  t."Id" , CASE WHEN t."Id" = t."ParentId" THEN NULL ELSE t."ParentId" END "ParentId", r."Level" + 1 "Level",
      ARRAY_APPEND("ListId", t."Id") AS "ListId",t."UserName"
      FROM  ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ParentId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_cte c 
    ORDER BY c."Level"`, [userName])

    let userNames: string[] = dataRaw.map(s => s.UserName);
    return userNames ?? []
  }

  async tree(id: Collaborators["Id"]) {
    let response: ResponseData = { status: false }
    var schema = this.configService.getOrThrow("database.schema", { infer: true });
    let data: GetTreeRawCollaboratorDto[] = await this.collaboratorRepository.query(`
    WITH RECURSIVE recursive_up_cte AS (
      SELECT c."Id", c."UserName", c."Name", c."ParentId", 
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id"  = $1
      UNION ALL
      SELECT  t."Id", t."UserName", t."Name", CASE WHEN t."Id" = t."ParentId" THEN NULL ELSE t."ParentId" END "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_up_cte r ON r."ParentId" =t."Id"  
      WHERE t."Id" <> ALL("ListId")
    ),
    recursive_down_cte AS (
      SELECT c."Id", c."UserName", c."Name", c."ParentId", 
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id"  = $2
      UNION ALL
      SELECT  t."Id", t."UserName", t."Name", CASE WHEN t."Id" = t."ParentId" THEN NULL ELSE t."ParentId" END "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_down_cte r ON r."Id" =t."ParentId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_up_cte c 
    UNION all
    SELECT * FROM recursive_down_cte c 
    WHERE c."Id" <> $3 
    `, [id, id, id])
    let trees: Partial<GetTreeCollaboratorDto> = {};
    let itemParent = data.find(s => s.ParentId == null)
    trees = {
      key: itemParent.Id,
      label: `${itemParent.UserName} - ${itemParent.Name}`,
      children: this.processTreeChild(data, itemParent.Id)
    };
    response.status = true;
    response.data = trees;
    return response
  }

  private processTreeChild(treeDatas: GetTreeRawCollaboratorDto[], collaboratorId: number | string | null): GetTreeCollaboratorDto[] {
    let childs = treeDatas
      .filter(s => s.ParentId == collaboratorId)
      .map(s => new GetTreeCollaboratorDto({
        key: s.Id,
        label: `${s.UserName} - ${s.Name}`,
      }))

    childs.forEach(item => {
      item.children = this.processTreeChild(treeDatas, item.key)
    })
    return childs
  }
  async treeCom(id: Collaborators["Id"]) {
    let response: ResponseData = { status: false }
    var schema = this.configService.getOrThrow("database.schema", { infer: true });
    let data: GetTreeRawCollaboratorDto[] = await this.collaboratorRepository.query(`
    WITH RECURSIVE recursive_up_cte AS (
      SELECT c."Id", c."UserName", c."Name", cr."Name" "RankName",opr."Value" , CASE WHEN c."Id" = c."ManageId" THEN NULL ELSE c."ManageId" END "ParentId", 
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      INNER JOIN ${schema}."CollaboratorRanks" cr ON c."RankId" = cr."Id"
      left join ${schema}."Decisions" d on c."LastDecisionId" = d."Id"
      left join ${schema}."OrgPolicyRanks" opr on d."OrgPolicyRankId" = opr."Id"
      WHERE c."Id"  = $1
      UNION ALL
      SELECT  t."Id", t."UserName", t."Name", cr."Name" "RankName",opr."Value" ,  CASE WHEN t."Id" = t."ManageId" THEN NULL ELSE t."ManageId" END "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      INNER JOIN ${schema}."CollaboratorRanks" cr ON t."RankId" = cr."Id"
      JOIN recursive_up_cte r ON r."ParentId" =t."Id"  
      left join ${schema}."Decisions" d on t."LastDecisionId" = d."Id"
      left join ${schema}."OrgPolicyRanks" opr on d."OrgPolicyRankId" = opr."Id"
      WHERE t."Id" <> ALL("ListId")
    ),
    recursive_down_cte AS (
      SELECT c."Id", c."UserName", c."Name", cr."Name" "RankName",opr."Value" , CASE WHEN c."Id" = c."ManageId" THEN NULL ELSE c."ManageId" END "ParentId", 
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      INNER JOIN ${schema}."CollaboratorRanks" cr ON c."RankId" = cr."Id"
      left join ${schema}."Decisions" d on c."LastDecisionId" = d."Id"
      left join ${schema}."OrgPolicyRanks" opr on d."OrgPolicyRankId" = opr."Id"
      WHERE c."Id"  = $2
      UNION ALL
      SELECT  t."Id", t."UserName", t."Name", cr."Name" "RankName",opr."Value" ,  CASE WHEN t."Id" = t."ManageId" THEN NULL ELSE t."ManageId" END "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      INNER JOIN ${schema}."CollaboratorRanks" cr ON t."RankId" = cr."Id"
      left join ${schema}."Decisions" d on t."LastDecisionId" = d."Id"
      left join ${schema}."OrgPolicyRanks" opr on d."OrgPolicyRankId" = opr."Id"
      JOIN recursive_down_cte r ON r."Id" =t."ManageId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_up_cte c
    UNION all
    SELECT * FROM recursive_down_cte c 
    WHERE c."Id" <> $3`, [id, id, id])
    let trees: Partial<GetTreeCollaboratorDto> = {};
    if (data && data.length > 0) {
      let itemParent = data.find(s => s.ParentId == null)
      trees = {
        key: itemParent.Id,
        label: `${itemParent.UserName} - ${itemParent.Name} - ${itemParent.RankName} - ${this.formatNumber(itemParent.Value ?? 0)}`,
        children: this.processTreeComChild(data, itemParent.Id)
      };
    }
    response.status = true;
    response.data = trees;
    return response
  }

  private formatNumber(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  private processTreeComChild(treeDatas: GetTreeRawCollaboratorDto[], collaboratorId: number | string | null): GetTreeCollaboratorDto[] {
    let childs = treeDatas
      .filter(s => s.ParentId == collaboratorId)
      .map(s => new GetTreeCollaboratorDto({
        key: s.Id,
        label: `${s.UserName} - ${s.Name} - ${s.RankName} - ${this.formatNumber(s.Value ?? 0)}`,
      }))

    childs.forEach(item => {
      item.children = this.processTreeComChild(treeDatas, item.key)
    })
    return childs
  }

  async import(importCollaboratorDto: ImportCollaboratorDto[], user: JwtPayloadType) {

    let response: ResponseData = { status: false }
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const importCollaboratorsDto of importCollaboratorDto) {
        let info = await queryRunner.manager.save(
          queryRunner.manager.create(Collaborators,
            {
              ...importCollaboratorsDto,
              CreatedBy: user.userName
            })
        );

        info.UserName = `EL${String(info.Id).padStart(3, '0')}`
        await queryRunner.manager.save(
          queryRunner.manager.create(Collaborators,
            {
              Id: info.Id,
              UserName: info.UserName
            }));

        let userInfo: CreateUserDto = {
          UserName: info.UserName,
          Password: importCollaboratorsDto.Password,
          DisplayName: info.Name,
          Email: info.Email,
          Mobile: info.Mobile,
          Address: info.Address,
          ApplicationType: ApplicationTypeEnums.Sale
        }

        await queryRunner.manager.save(
          queryRunner.manager.create(Users,
            {
              ...userInfo,
              UserName: info.UserName
            }));

      }

      await queryRunner.commitTransaction();
      response.status = true;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      response.message = error.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }
  async resetPassword(id: Collaborators["Id"], password: string) {
    var response: ResponseData = { status: false }
    await this.collaboratorRepository.save(
      this.collaboratorRepository.create({
        Id: id,
        Password: StringToMd5(password)
      }),
    );
    response.status = true;
    return response
  }

  async deposit(id: Collaborators["Id"], createAvailableDepositDto: CreateAvailableDepositDto) {
    let response: ResponseData = { status: false }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let info = await queryRunner.manager.findOne(Collaborators, { where: { Id: id } })

      if (!info) {
        response.message = {
          Collaborator: 'Vui lòng kiểm tra lại thông tin, tài khoản không hợp lệ!!!'
        }

        return response
      }

      let wallet = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: id,
          WalletTypeEnums: WalletTypeEnums.Source,
        }
      })

      let insertResult = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Wallets)
        .values({
          CollaboratorId: id,
          Available: createAvailableDepositDto.AvailableDeposit,
          WalletTypeEnums: WalletTypeEnums.Source,
          Total: wallet ? wallet.Total + createAvailableDepositDto.AvailableDeposit : createAvailableDepositDto.AvailableDeposit,
        })
        .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
          "Total" = "Wallets"."Total" + ${createAvailableDepositDto.AvailableDeposit},
          "Available" = "Wallets"."Available" + ${createAvailableDepositDto.AvailableDeposit}`)
        .returning("*")
        .execute();

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: wallet?.Id ?? insertResult.raw[0].Id,
          WalletType: wallet?.WalletTypeEnums ?? insertResult.raw[0].WalletTypeEnums,
          Value: createAvailableDepositDto.AvailableDeposit,
          Note: (createAvailableDepositDto.Note == '' ? null : createAvailableDepositDto.Note) ?? (createAvailableDepositDto.AvailableDeposit > 0 ? "Nạp" : "Khấu trừ"),
          IsAdmin: true
        })
      )

      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      await queryRunner.release();
    }
    return response;
  }

  async countCollabIsSaleTrue(): Promise<number> {
    const count = await this.collaboratorRepository.count({
      where: { IsSale: true }
    });
    return count;
  }

  async countCollabIsSaleFalse(): Promise<number> {
    const count = await this.collaboratorRepository.count({
      where: { IsSale: false }
    });
    return count;
  }

  async countCollabRanksVe(): Promise<number> {
    const count = await this.collaboratorRepository.count({
      where: { Rank: Not(In([RankEnums.None])) }
    });
    return count;
  }

  //   async binarTreeAdmin() {
  //     var schema = this.configService.getOrThrow("database.schema", { infer: true });

  //     let dataRaw: BinaryCollaboratorDto[] = await this.collaboratorRepository.query(`
  //     select 
  // 	    bt."Id" ,
  // 	    c."Name",
  // 	    c."UserName",
  // 	    c."Rank",
  // 	    bt."ParentId"
  //     from
  // 	    ${schema}."BinaryTrees" bt
  //     left join ${schema}."Collaborators" c on bt."CollaboratorId" = c."Id"
  //     order by bt."Id" asc  
  // `)

  //     return dataRaw
  //   }

  async binarTreeAdmin() {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: Record[] = await this.collaboratorRepository.query(`
    select 
	    ROW_NUMBER() OVER (ORDER BY bt."Id" ASC) as "Stt",
	    bt."Id",
    	c."UserName",
	    c."Rank",
	    bt."ParentId"
    from
	    ${schema}."BinaryTrees" bt
    left join ${schema}."Collaborators" c on bt."CollaboratorId" = c."Id"
`)

    return dataRaw
  }

  async binarTree(id: Collaborators["Id"]) {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: BinaryCollaboratorDto[] = await this.collaboratorRepository.query(`
    WITH RECURSIVE recursive_cte AS
      (SELECT c."Id",
          c."Name",
          c."Rank",
          c."UserName",
          CASE
              WHEN c."Id" = $1 THEN NULL
              ELSE c."ParentId"
          END AS "ParentId",
        ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id" = $1
      UNION ALL
      SELECT t."Id",
                    t."Name",
                    t."Rank",
                    t."UserName",
                    CASE
                        WHEN t."Id" = t."ParentId" THEN NULL
                        ELSE t."ParentId"
                    END AS "ParentId",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ParentId"
      WHERE t."Id" <> ALL("ListId"))
    SELECT *
    FROM recursive_cte c
    ORDER BY c."Id" ASC
`, [id])

    return dataRaw
  }

  async mailMerge(templatePath: string, outputPath: string) {
    let response: ResponseData = { status: false }

    let data = {
      firstName: 'Nguyen',
      lastName: 'Van A',
      eventDate: '23/10/2024',
    }

    try {
      // Đọc file mẫu .docx
      const content = fs.readFileSync(templatePath, 'binary');

      // Tạo một instance của PizZip  
      const zip = new PizZip(content);

      // Tạo instance của Docxtemplater với file zip đã tải
      const doc = new Docxtemplater(zip);

      // Gán dữ liệu cho document
      doc.setData(data);

      // Xử lý tài liệu với dữ liệu đã cung cấp
      doc.render();

      // Xuất file tài liệu mới với thông tin đã merge
      const output = doc.getZip().generate({ type: 'nodebuffer' });

      // Ghi file kết quả ra đĩa
      fs.writeFileSync(outputPath, output);

      console.log('File đã được tạo thành công:', outputPath);
      response.status = true
      response.message = `File đã được tạo thành công: ${outputPath}`
    } catch (error) {
      console.error('Lỗi khi thực hiện mail merge:', error);
      response.message = `Lỗi khi thực hiện mail merge: ${error}`
    }

    return response
  }

}
