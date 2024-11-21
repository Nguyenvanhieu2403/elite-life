import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { Products } from 'src/database/entities/products.entity';
import { ActionParam, FunctionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums, FunctionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { pagination } from 'src/utils/pagination';
import { ResponseData } from 'src/utils/schemas/common.schema';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { UserActivitiesService } from '../user-activities/user-activities.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WalletDetailsService } from '../wallet-details/wallet-details.service';
import { ILike, In, Not } from 'typeorm';
import { WalletTypeEnums } from 'src/utils/enums.utils';
import { OrderDetailsService } from '../order-details/order-details.service';
import { DeliveryOrderDto } from './dto/pay-order.dto';

@ApiTags("Admin/Orders")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-admin'))
@Controller('admin/orders')
@FunctionParam(FunctionPermissionEnums.Order)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private configService: ConfigService<AllConfigType>,
        private readonly userActivitiesService: UserActivitiesService,
        private readonly walletDetailsService: WalletDetailsService,
        private readonly orderDetailsService: OrderDetailsService,

    ) { }

    @ActionParam([ActionPermissionEnums.Index])
    @Get("get")
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filters', new DefaultValuePipe("")) filters: string,
    ) {
        if (limit > 50) {
            limit = 50;
        }
        let where = GridFilterParse.ParseWhere<Orders>(filters);

        let [data, total] = await this.ordersService.findManyWithPagination({
            relations: {
                Product: true,
                Collaborator: true,
                // OrderDetails: {
                //     Collaborator: true
                // },
                OrderPays: true
            },
            where: where,
            select: {
                Product: {
                    Id: true,
                    Name: true,
                    Price: true
                },
                Collaborator: {
                    Id: true,
                    Name: true,
                    UserName: true,
                    Rank: true
                },
                // OrderDetails: {
                //     Id: true,
                //     WalletTypeEnums: true,
                //     Value: true,
                //     Collaborator: {
                //         Id: true,
                //         Name: true,
                //         UserName: true,
                //         Rank: true,
                //     }
                // },
                OrderPays: {
                    Id: true,
                    Value: true,
                    Note: true,
                    PayDate: true
                }
            }
        }, { page, limit })
        return pagination(data, total);
    }

    @ActionParam([ActionPermissionEnums.Index])
    @Get('commission-payment-history/:orderId')
    async CommissionPaymentHistory(
        @Param('orderId') orderId: string
    ) {
        let response: ResponseData = { status: false }
        let orderDetails = await this.orderDetailsService.find({ where: { OrderId: +orderId } })
        let collaboratorIds = orderDetails.map(s => s.CollaboratorId)

        let walletDetails = await this.walletDetailsService.find({
            relations: {
                Wallet: {
                    Collaborator: true
                }
            },
            where: {
                Wallet: {
                    CollaboratorId: In(collaboratorIds),
                    WalletTypeEnums: Not(In([WalletTypeEnums.Source])),
                }
            },
            select: {
                CreatedAt: true,
                Id: true,
                Wallet: {
                    Id: true,
                    Collaborator: {
                        Id: true,
                        Name: true,
                        UserName: true,
                        Rank: true
                    }
                },
                Value: true,
                Note: true
            },
            order: {
                Value: 'asc'
            }
        })

        response.status = true
        response.data = walletDetails ?? []
        return response
    }

    @ActionParam([ActionPermissionEnums.Add])
    @Post('delivered/:id')
    async delivered(@Param('id') id: string,
        @UserInfo() user: JwtPayloadType,
        @Body() DeliveryOrderDto: DeliveryOrderDto
    ) {
        let response: ResponseData = { status: false }

        let order = await this.ordersService.findOne({ where: { Id: +id }, relations: { Collaborator: true } });
        if (!order.NameSale) {
            response.message = 'Đơn hàng chưa có thông tin người nhận. Thao tác không thành công!!'

            return response
        }

        await this.userActivitiesService.create({
            NewRequestData: null,
            OldRequestData: order,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Đơn hàng #${order.Id} giao thành công tới KH: ${order.NameSale}`,
            RecordId: order.Id
        }, user)

        response = await this.ordersService.isDelivered(+id, { Id: +id, IsDelivered: true, DeliveryDate: DeliveryOrderDto.DeliveryDate });

        return response
    }

}
