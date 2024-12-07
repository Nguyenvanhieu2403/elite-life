import { Injectable } from '@nestjs/common';
import { Collaborators } from 'src/database/entities/collaborator/collaborators.entity';
import { UserWalletStates } from 'src/database/entities/collaborator/userWalletStates.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindManyOptions, FindOneOptions, FindOptionsWhere, In, Raw, Repository } from 'typeorm';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { BinaryCollaboratorDto, GetSystemCollaboratorDto } from './dto/get-system-collaborator.dto';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApplicationTypeEnums, FileTypeEnums, RankEnums, WalletTypeEnums } from 'src/utils/enums.utils';
import { UsersService } from '../users/users.service';
import { UploadFiles } from 'src/database/entities/uploadFiles.entity';
import { FileHelper } from 'src/utils/file-helper';
import * as path from 'path'
import * as moment from 'moment'
import { AuthRegisterDto } from '../auth/dto/auth-register.dto';
import { StringToMd5 } from 'src/utils/common-helper';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Wallets } from 'src/database/entities/collaborator/wallet.entity';
import { WalletDetails } from 'src/database/entities/collaborator/walletDetail.entity';
import { CreateAvailableDepositDto, InternalTransferDto, PersonalMoneyTransferDto } from './dto/create-collaborator-contractNumber.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { Contracts } from 'src/database/entities/collaborator/contracts.entity';
@Injectable()
export class CollaboratorsService {
  constructor(
    @InjectRepository(Collaborators)
    private collaboratorsRepository: Repository<Collaborators>,
    @InjectRepository(UploadFiles)
    private uploadFilesRepository: Repository<UploadFiles>,
    private usersService: UsersService,
    private configService: ConfigService<AllConfigType>,
    private dataSource: DataSource,
    private readonly userActivitiesService: UserActivitiesService,
    @InjectRepository(Contracts)
    private contractsRepository: Repository<Contracts>,
  ) { }

  async find(options?: FindManyOptions<Collaborators>) {
    return await this.collaboratorsRepository.find(options);
  }

  async exist(options?: FindManyOptions<Collaborators>) {
    return await this.collaboratorsRepository.exist(options);
  }

  async findManyWithPagination(options?: FindManyOptions<Collaborators>, paginationOptions?: IPaginationOptions,) {
    return await this.collaboratorsRepository.findAndCount({
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
    return await this.collaboratorsRepository.findOne(options);
  }

  async systemList(
    options: FindManyOptions<Collaborators>,
    paginationOptions: IPaginationOptions,
    user: JwtPayloadType
  ): Promise<[Collaborators[], number]> {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: GetSystemCollaboratorDto[] = await this.collaboratorsRepository.query(`
    WITH RECURSIVE recursive_cte AS (
      SELECT c."Id", CASE WHEN c."Id" = c."ManageId" THEN NULL ELSE c."ManageId" END "ParentId", 1 "Level",
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id"  = $1
      UNION ALL
      SELECT  t."Id", CASE WHEN t."Id" = t."ManageId" THEN NULL ELSE t."ManageId" END "ParentId", r."Level" + 1 "Level",
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ManageId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_cte c 
    WHERE c."Id"  <> $2
    ORDER BY c."Level"`, [user.collaboratorInfo?.Id, user.collaboratorInfo?.Id])
    let ids = dataRaw.map(s => s.Id);

    if (options == undefined || options.where == undefined) options.where = {}
    options.where = {
      ...options.where,
      Id: In(ids)
    }
    let [data, total] = await this.findManyWithPagination(options, paginationOptions);
    for (const item of data) {
      if (item.Email && item.Email.length > 4) item.Email = `----${item.Email.substring(4)}`
      if (item.Mobile && item.Mobile.length > 6) item.Mobile = `------${item.Mobile.substring(6)}`
      item.Level = dataRaw.find(s => s.Id == item.Id)?.Level
    }
    return [data, total]
  }

  async referalList(
    options: FindManyOptions<Collaborators>,
    paginationOptions: IPaginationOptions,
    user: JwtPayloadType
  ): Promise<[Collaborators[], number]> {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: GetSystemCollaboratorDto[] = await this.collaboratorsRepository.query(`
    WITH RECURSIVE recursive_cte AS (
      SELECT c."Id", CASE WHEN c."Id" = c."ParentId" THEN NULL ELSE c."ParentId" END "ParentId",
      ARRAY[c."Id"] "ListId"
      FROM ${schema}."Collaborators" c
      WHERE c."Id"  = $1
      UNION ALL
      SELECT  t."Id", CASE WHEN t."Id" = t."ParentId" THEN NULL ELSE t."ParentId" END "ParentId", 
      ARRAY_APPEND("ListId", t."Id") AS "ListId"
      FROM ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ParentId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_cte c 
    WHERE c."Id"  <> $2`, [user.collaboratorInfo?.Id, user.collaboratorInfo?.Id])
    let ids = dataRaw.map(s => s.Id);

    if (options == undefined || options.where == undefined) options.where = {}
    options.where = {
      ...options.where,
      Id: In(ids)
    }
    let [data, total] = await this.findManyWithPagination(options, paginationOptions);
    for (const item of data) {
      item.Level = dataRaw.find(s => s.Id == item.Id)?.Level
      if (item.Level > 2) {
        if (item.Email && item.Email.length > 4) item.Email = `----${item.Email.substring(4)}`
        if (item.Mobile && item.Mobile.length > 6) item.Mobile = `------${item.Mobile.substring(6)}`
      }
    }
    return [data, total]
  }

  async binarTree(user: JwtPayloadType) {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });

    let dataRaw: BinaryCollaboratorDto[] = await this.collaboratorsRepository.query(`
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
`, [user.collaboratorInfo?.Id])

    return dataRaw
  }

  async register(registerDto: AuthRegisterDto, user: JwtPayloadType) {
    var response: ResponseData = { status: false }

    var info = await this.collaboratorsRepository.save(
      this.collaboratorsRepository.create({
        ...registerDto,
        CreatedBy: user.userName,
        Rank: RankEnums.None
      }),
    );

    if (registerDto.ParentCode) {
      let collaborator = await this.collaboratorsRepository.findOne({
        where: { UserName: registerDto.ParentCode, IsSale: true }
      })

      await this.collaboratorsRepository.save(
        this.collaboratorsRepository.create({
          Id: info.Id,
          ParentId: collaborator.Id,
        }),
      );
    }

    info.UserName = `EL${String(info.Id).padStart(3, '0')}`
    await this.collaboratorsRepository.save(
      this.collaboratorsRepository.create({
        Id: info.Id,
        UserName: info.UserName
      }));

    if (registerDto.File) {
      const fileExtension = registerDto.File.originalname.split('.').pop();
      var dirFile = this.configService.getOrThrow("app.dirFile", { infer: true });
      // 20 is File Id in table UploadFiles
      const fileName = `${info.UserName}-20-${moment().format("YYYYMMDDHHmmss")}.${fileExtension}`;
      FileHelper.SaveFile(registerDto.File, path.resolve(dirFile, "Files", "Collaborator"), fileName);
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
      Password: registerDto.Password,
      DisplayName: info.Name,
      Email: info.Email,
      Mobile: info.Mobile,
      Address: info.Address,
      ApplicationType: ApplicationTypeEnums.Sale
    }

    await this.usersService.create(userInfo, user)

    await this.collaboratorsRepository.save(
      this.collaboratorsRepository.create({
        Id: info.Id,
        Rank: RankEnums.None
      })
    )

    delete info.Password;
    response.status = true;
    response.data = info;
    return response
  }

  async resetPassword(id: Collaborators["Id"], password: string) {
    var response: ResponseData = { status: false }
    await this.collaboratorsRepository.save(
      this.collaboratorsRepository.create({
        Id: id,
        Password: StringToMd5(password)
      }),
    );
    response.status = true;
    return response
  }

  async update(id: Collaborators["Id"], updateCollaboratorDto: UpdateSaleDto, user: JwtPayloadType) {
    var response: ResponseData = { status: false }

    await this.collaboratorsRepository.save(
      this.collaboratorsRepository.create({
        Id: id,
        ...updateCollaboratorDto
      }),
    );

    response.status = true;
    return response
  }

  async salerList(userName: string) {
    var schema = this.configService.getOrThrow("database.schema", { infer: true });
    let dataRaw = await this.collaboratorsRepository.query(
      `WITH RECURSIVE recursive_cte AS (
      SELECT c."Id", CASE WHEN c."Id" = c."ManageId" THEN NULL ELSE c."ManageId" END "ManageId", 1 "Level",
      ARRAY[c."Id"] "ListId",c."UserName"
      FROM  ${schema}."Collaborators" c
      WHERE c."UserName"  = $1
      UNION ALL
      SELECT  t."Id" , CASE WHEN t."Id" = t."ManageId" THEN NULL ELSE t."ManageId" END "ManageId", r."Level" + 1 "Level",
      ARRAY_APPEND("ListId", t."Id") AS "ListId",t."UserName"
      FROM  ${schema}."Collaborators" t
      JOIN recursive_cte r ON r."Id" = t."ManageId"  
      WHERE t."Id" <> ALL("ListId")
    )
    SELECT * FROM recursive_cte c 
    ORDER BY c."Level"`, [userName])

    let userNames: string[] = dataRaw.map(s => s.UserName);
    return userNames ?? []
  }

  async deposit(createAvailableDepositDto: CreateAvailableDepositDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let info = await queryRunner.manager.findOne(Collaborators, { where: { Id: user.collaboratorInfo.Id } })

      if (!info) {
        response.message = {
          Collaborator: 'Vui lòng kiểm tra lại thông tin, tài khoản không hợp lệ!!!'
        }

        return response
      }

      let wallet = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: user.collaboratorInfo.Id,
          WalletTypeEnums: WalletTypeEnums.Source,
        }
      })

      let insertResult = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Wallets)
        .values({
          CollaboratorId: user.collaboratorInfo.Id,
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
          Note: "Nạp"
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

  //chuyển tiền cá nhân 
  async personalMoneyTransfer(personalMoneyTransferDto: PersonalMoneyTransferDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    // const processingWallets = new Set<number>();
    // if (processingWallets.has(user.id)) {
    //   response.message = 'Giao dịch đang được xử lý, vui lòng thử lại sau!';
    //   return response;
    // }
    
    // processingWallets.add(user.id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    // const userWalletState = await queryRunner.manager.findOne(UserWalletStates, {
    //   where: {
    //     UserId: user.id,
    //     WalletType: personalMoneyTransferDto.WalletTypeFrom,
    //   },
    // });

    // if (userWalletState && userWalletState.Status === 'Pending') {
    //   response.message = 'Đang có giao dịch rút tiền chưa hoàn tất. Vui lòng thử lại sau!';
    //   return response;
    // }

    // // 2. Đặt trạng thái thành "Pending" trước khi bắt đầu giao dịch
    // if (!userWalletState) {
    //   await queryRunner.manager.insert(UserWalletStates, {
    //     UserId: user.id,
    //     WalletType: personalMoneyTransferDto.WalletTypeFrom,
    //     Status: 'Pending',
    //   });
    // } else {
    //   await queryRunner.manager.update(UserWalletStates, { Id: userWalletState.Id }, { Status: 'Pending' });
    // }
    await queryRunner.startTransaction();
    try {

      

      // 1. Kiểm tra trạng thái giao dịch
      

      if (personalMoneyTransferDto.WalletTypeFrom == WalletTypeEnums.Sale3) {
        response.message = 'NVKD không được rút tiền từ ví này !!!'

        return response
      }

      if (personalMoneyTransferDto.WalletTypeFrom == WalletTypeEnums.Source) {
        response.message = 'Có lỗi xảy ra, vui lòng thử lại !!!'

        return response
      }

      let info = await queryRunner.manager.findOne(Collaborators, { where: { Id: user.collaboratorInfo.Id } })
      if (!info) {
        response.message = 'Vui lòng kiểm tra lại thông tin, tài khoản không hợp lệ!!!'

        return response
      }
      if (info.Rank == RankEnums.None) {
        response.message = 'NVKD chưa đủ điều kiện rút tiền !!!'

        return response
      }
      if (personalMoneyTransferDto.WalletTypeFrom == WalletTypeEnums.Sale2) {
        if (info.Rank == RankEnums.V) {
          response.message = 'NVKD chưa được rút tiền từ ví này !!!'

          return response
        }
      }

      let walletFrom = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: user.collaboratorInfo.Id,
          WalletTypeEnums: personalMoneyTransferDto.WalletTypeFrom,
        }
      })
      if (
        !walletFrom || walletFrom.Available < personalMoneyTransferDto.Available
      ) {
        response.message = 'Số dư không đủ, thao tác không thành công !!!'

        return response
      }

      let walletTo = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: user.collaboratorInfo.Id,
          WalletTypeEnums: WalletTypeEnums.Source,
        }
      })

      let resultFrom = await queryRunner.manager.createQueryBuilder()
        .update(Wallets)
        .set({
          Available: () => `"Available" - ${personalMoneyTransferDto.Available}`,
        } as QueryDeepPartialEntity<Wallets>)
        .where({
          Id: walletFrom.Id,
          WalletTypeEnums: personalMoneyTransferDto.WalletTypeFrom,
          Available: Raw(alias => `${alias} - ${personalMoneyTransferDto.Available} >=0`),
        } as FindOptionsWhere<Wallets>)
        .returning("*")
        .execute();

      let resultTo = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Wallets)
        .values({
          CollaboratorId: user.collaboratorInfo.Id,
          Available: personalMoneyTransferDto.Available,
          WalletTypeEnums: WalletTypeEnums.Source,
          Total: walletTo ? walletTo.Total + personalMoneyTransferDto.Available : personalMoneyTransferDto.Available,
        })
        .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
          "Total" = "Wallets"."Total" + ${personalMoneyTransferDto.Available},
          "Available" = "Wallets"."Available" + ${personalMoneyTransferDto.Available}`)
        .execute();

      let walletTypeStringEnums: { [key: string]: string } = {
        Source: "Cá nhân",
        CustomerShare: "Đồng chia",
        CustomerGratitude: "Tri ân",
        Sale1: "Hoa hồng giới thiệu",
        Sale2: "Thưởng lãnh đạo",
      }

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: walletFrom?.Id ?? resultFrom.raw[0].Id,
          WalletType: personalMoneyTransferDto.WalletTypeFrom,
          Value: -personalMoneyTransferDto.Available,
          Note: `Rút hoa hồng từ ví ${walletTypeStringEnums[personalMoneyTransferDto.WalletTypeFrom]}`
        })
      )

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: walletTo?.Id ?? resultTo.raw[0].Id,
          WalletType: WalletTypeEnums.Source,
          Value: personalMoneyTransferDto.Available,
          Note: `Nạp tiền từ ví ${walletTypeStringEnums[personalMoneyTransferDto.WalletTypeFrom]}`
        })
      )

      let difference = await this.userActivitiesService.findDifference(walletFrom, resultFrom.raw[0])

      await this.userActivitiesService.create({
        NewRequestData: difference.newData,
        OldRequestData: difference.oldData,
        UserId: user.id,
        Action: user.Action[0],
        Function: user.Function,
        Description: `Chuyển : ${personalMoneyTransferDto.Available}ELP từ ví ${personalMoneyTransferDto.WalletTypeFrom}`,
        RecordId: walletFrom?.Id
      }, user)

     
      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      // processingWallets.delete(user.id);
       // // 4. Cập nhật trạng thái giao dịch thành "Done"
      //  await queryRunner.manager.update(UserWalletStates, { UserId: user.id, WalletType: personalMoneyTransferDto.WalletTypeFrom, }, { Status: 'Done' });

      await queryRunner.release();
    }

    return response
  }

  //chuyển tiền nội bộ
  async internalTransfer(internalTransferDto: InternalTransferDto, user: JwtPayloadType) {
    let response: ResponseData = { status: false }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {

      // 1. Kiểm tra trạng thái giao dịch
      const userWalletState = await queryRunner.manager.findOne(UserWalletStates, {
        where: {
          UserId: user.id,
          WalletType: WalletTypeEnums.Source,
        },
      });

      if (userWalletState && userWalletState.Status === 'Pending') {
        response.message = 'Đang có giao dịch rút tiền chưa hoàn tất. Vui lòng thử lại sau!';
        return response;
      }

      // 2. Đặt trạng thái thành "Pending" trước khi bắt đầu giao dịch
      if (!userWalletState) {
        await queryRunner.manager.insert(UserWalletStates, {
          UserId: user.id,
          WalletType: WalletTypeEnums.Source,
          Status: 'Pending',
        });
      } else {
        await queryRunner.manager.update(UserWalletStates, { Id: userWalletState.Id }, { Status: 'Pending' });
      }



      let collaFrom = await queryRunner.manager.findOne(Collaborators, {
        where: { Id: user.collaboratorInfo.Id }
      })
      if (!collaFrom) {
        response.message = 'Có lỗi xảy ra, vui lòng kiểm tra lại thông tin!!!'

        return response
      }

      let collaTo = await queryRunner.manager.findOne(Collaborators, {
        where: { UserName: internalTransferDto.CollaboratorCode }
      })
      if (!collaTo) {
        response.message = 'Vui lòng kiểm tra lại thông tin, tài khoản không hợp lệ!!!'

        return response
      }

      let walletFrom = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: user.collaboratorInfo.Id,
          WalletTypeEnums: WalletTypeEnums.Source,
        }
      })
      if (
        !walletFrom || walletFrom.Available < internalTransferDto.Available
      ) {
        response.message = 'Số dư không đủ, thao tác không thành công !!!'

        return response
      }

      let walletTo = await queryRunner.manager.findOne(Wallets, {
        where: {
          CollaboratorId: collaTo.Id,
          WalletTypeEnums: WalletTypeEnums.Source,
        }
      })

      let resultFrom = await queryRunner.manager.createQueryBuilder()
        .update(Wallets)
        .set({
          Available: () => `"Available" - ${internalTransferDto.Available}`,
        } as QueryDeepPartialEntity<Wallets>)
        .where({
          Id: walletFrom.Id,
          WalletTypeEnums: WalletTypeEnums.Source,
          Available: Raw(alias => `${alias} - ${internalTransferDto.Available} >=0`),
        } as FindOptionsWhere<Wallets>)
        .returning("*")
        .execute();

      let resultTo = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Wallets)
        .values({
          CollaboratorId: collaTo.Id,
          Available: internalTransferDto.Available,
          WalletTypeEnums: WalletTypeEnums.Source,
          Total: walletTo ? walletTo.Total + internalTransferDto.Available : internalTransferDto.Available,
        })
        .onConflict(`("CollaboratorId", "WalletTypeEnums") DO UPDATE SET 
        "Total" = "Wallets"."Total" + ${internalTransferDto.Available},
        "Available" = "Wallets"."Available" + ${internalTransferDto.Available}`)
        .execute();

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: walletFrom?.Id ?? resultFrom.raw[0].Id,
          WalletType: WalletTypeEnums.Source,
          Value: -internalTransferDto.Available,
          Note: `Chuyển tiền tới ví của #${collaTo.UserName}`
        })
      )

      await queryRunner.manager.save(
        queryRunner.manager.create(WalletDetails, {
          WalletId: walletTo?.Id ?? resultTo.raw[0].Id,
          WalletType: WalletTypeEnums.Source,
          Value: internalTransferDto.Available,
          Note: `Nhận tiền từ ví của #${collaFrom.UserName}`
        })
      )

      let difference = await this.userActivitiesService.findDifference(walletFrom, resultFrom.raw[0])

      await this.userActivitiesService.create({
        NewRequestData: difference.newData,
        OldRequestData: difference.oldData,
        UserId: user.id,
        Action: user.Action[0],
        Function: user.Function,
        Description: `Chuyển : ${internalTransferDto.Available}ELP vào ví của #${collaTo.UserName}`,
        RecordId: walletFrom?.Id
      }, user)

      // 4. Cập nhật trạng thái giao dịch thành "Done"
      await queryRunner.manager.update(UserWalletStates, { UserId: user.id, WalletType: WalletTypeEnums.Source, }, { Status: 'Done' });
      await queryRunner.commitTransaction();
      response.status = true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      response.message = err.message;
    } finally {
      await queryRunner.release();
    }

    return response
  }

}
