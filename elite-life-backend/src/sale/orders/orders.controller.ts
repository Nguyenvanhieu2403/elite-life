import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { PayOrderDto, UpdateDeliverySaleDto } from './dto/pay-order.dto';
import { ComboData, ResponseData } from 'src/utils/schemas/common.schema';
import { OrdersService } from './orders.service';
import { UserInfo } from 'src/utils/decorator/jwt.decorator';
import { JwtPayloadType } from 'src/utils/strategies/types/jwt-payload.type';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from '../products/products.service';
import { Orders } from 'src/database/entities/collaborator/order.entity';
import { ActionParam } from 'src/permissions/permission.decorator';
import { ActionPermissionEnums } from 'src/permissions/permission.enum';
import { GridFilterParse } from 'src/utils/common-helper';
import { pagination } from 'src/utils/pagination';
import { OrderPaysService } from '../order-pays/order-pays.service';
import { RankEnums } from 'src/utils/enums.utils';
import { IsNull, Not } from 'typeorm';
import { UserActivitiesService } from '../user-activities/user-activities.service';

@ApiTags("Sale/Orders")
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt-sale'))
@Controller('sale/orders')
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly productsService: ProductsService,
        private readonly orderPaysService: OrderPaysService,
        private readonly userActivitiesService: UserActivitiesService,
    ) { }

    @ActionParam([ActionPermissionEnums.Index])
    @Get("get")
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('filters', new DefaultValuePipe("")) filters: string,
        @UserInfo() user: JwtPayloadType,
    ) {
        if (limit > 50) {
            limit = 50;
        }
        let where = GridFilterParse.ParseWhere<Orders>(filters);
        where.CollaboratorId = user.collaboratorInfo.Id

        let [data, total] = await this.ordersService.findManyWithPagination({
            relations: {
                Collaborator: true,
                // OrderDetails: {
                //     Collaborator: true
                // }
            },
            where: where,
            select: {
                Collaborator: {
                    Id: true,
                    Name: true,
                    UserName: true,
                    Rank: true
                },
                // OrderDetails: {
                //     Id: true,
                //     Collaborator: {
                //         Id: true,
                //         Name: true,
                //         UserName: true,
                //         Rank: true
                //     }
                // }
            }
        }, { page, limit })
        return pagination(data, total);
    }

    @Get("pay")
    async getPay() {
        let response: ResponseData = { status: false }

        let product = await this.productsService.find({ order: { Id: 'ASC' } })
        response.status = true
        response.data = {
            Products: product.map(s => new ComboData({
                Text: s.Name,
                Value: s.Id,
                Extra: s.Price
            })),
        }

        return response
    }

    @ActionParam([ActionPermissionEnums.Add])
    @Post("pay")
    async pay(
        @Body() payOrderDto: PayOrderDto,
        @UserInfo() user: JwtPayloadType,
    ) {
        return await this.ordersService.pay(payOrderDto, user)
    }

    @ActionParam([ActionPermissionEnums.Add])
    @Post("activate")
    async activate(
        @UserInfo() user: JwtPayloadType,
    ) {
        return await this.ordersService.activate(user)
    }

    @Get("historyPay")
    async historyPay(
        @UserInfo() user: JwtPayloadType,
    ) {
        let response: ResponseData = { status: false }

        let order = await this.ordersService.findOne({
            relations: {
                OrderPays: true
            },
            where: { CollaboratorId: user.collaboratorInfo.Id },
            select: {
                OrderPays: {
                    Id: true,
                    Value: true,
                    PayDate: true
                }
            },
            order: {
                CreatedAt: 'DESC'
            }
        })

        if (order && order.Pending == 0) {
            if (user.collaboratorInfo.Rank == RankEnums.V && order.CommissionSale == order.CommissionSaleMax) {
                order.Payed = 0
                order.OrderPays = []
            }
        }

        let orders = await this.ordersService.find({
            relations: {
                Product: true
            },
            where: { CollaboratorId: user.collaboratorInfo.Id, CompletedDate: Not(IsNull()) },
            select: {
                Id: true,
                Product: {
                    Id: true,
                    Name: true,
                },
                Value: true,
                CompletedDate: true,
                IsDelivered: true,
                DeliveryDate: true,
                NameSale: true,
                MobileSale: true,
                AddressSale: true
            }
        })

        response.status = true
        response.data = {
            Order: order,
            OrderHistory: orders
        }
        return response
    }

    @Get('info-delivery-sale/:orderId')
    async getInfoDeliverySale(
        @Param('orderId') orderId: number
    ) {
        let response: ResponseData = { status: false }

        let order = await this.ordersService.findOne({
            relations: {
                Product: true
            },
            where: { Id: orderId, CompletedDate: Not(IsNull()) },
            select: {
                Id: true,
                NameSale: true,
                MobileSale: true,
                AddressSale: true
            }
        })

        response.status = true
        response.data = {
            Info: order
        }
        return response
    }

    @ActionParam([ActionPermissionEnums.Update])
    @Post('update/:orderId')
    async updateSaleDelivery(
        @Param('orderId') orderId: number,
        @Body() updateDeliverySaleDto: UpdateDeliverySaleDto,
        @UserInfo() user: JwtPayloadType,
    ) {
        let response: ResponseData = { status: false }

        let oldCollaborator = await this.ordersService.findOne({ where: { Id: orderId, CompletedDate: Not(IsNull()) } });

        if (oldCollaborator.IsDelivered == true && oldCollaborator.DeliveryDate != null) {
            response.message = 'Đơn hàng đã được gửi đi, thao tác không thành công!!'
            return response
        }

        response = await this.ordersService.update(orderId, {
            NameSale: updateDeliverySaleDto.NameSale,
            MobileSale: updateDeliverySaleDto.MobileSale,
            AddressSale: updateDeliverySaleDto.AddressSale
        })

        let newCollaborator = await this.ordersService.findOne({ where: { Id: orderId, CompletedDate: Not(IsNull()) } })
        let difference = await this.userActivitiesService.findDifference(oldCollaborator, newCollaborator)

        await this.userActivitiesService.create({
            NewRequestData: difference.newData,
            OldRequestData: difference.oldData,
            UserId: user.id,
            Action: user.Action[0],
            Function: user.Function,
            Description: `Thêm thông tin gửi đơn cho KH: ${updateDeliverySaleDto.NameSale}`,
            RecordId: newCollaborator.Id
        }, user)

        return response

    }
}
