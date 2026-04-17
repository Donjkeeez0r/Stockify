import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MoveStockDto } from './dto/move-stock.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(private prismaService: PrismaService) {}

  async moveStock(dto: MoveStockDto) {
    return this.prismaService.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Товар не найден!');
      }

      let newQuantity = product.quantity;

      switch (dto.type) {
        case TransactionType.IN:
          newQuantity += dto.amount;
          break;
        case TransactionType.OUT: {
          if (product.quantity < dto.amount) {
            throw new BadRequestException(
              `Недостаточно товара. На складе всего ${product.quantity}`,
            );
          }
          newQuantity -= dto.amount;
          break;
        }
        case TransactionType.ADJUST:
          newQuantity = dto.amount;
          break;
      }
      await tx.product.update({
        where: { id: dto.productId },
        data: { quantity: newQuantity },
      });

      const transactionRecord = await tx.inventoryTransaction.create({
        data: dto,
      });

      return {
        message: 'Операция успешна',
        newQuantity,
        transactionId: transactionRecord.id,
      };
    });
  }

  getAllTransactions() {
    return this.prismaService.inventoryTransaction.findMany();
  }
}
