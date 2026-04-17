import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MoveStockDto } from './dto/move-stock.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('inventory')
@ApiTags('Инвентарь')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('move')
  @ApiOperation({
    summary: 'Переместить товар',
    description:
      'Изменяет количество товара на складе. Поддерживает три типа операций: ' +
      '\nIN - приход товара (увеличивает количество). ' +
      'OUT - расход товара (уменьшает количество). ' +
      'ADJUST - установить точное количество.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное изменение количества товара на складе',
  })
  @ApiResponse({
    status: 404,
    description: 'Товар не найден',
  })
  @ApiResponse({
    status: 400,
    description: 'Недостаточно товара на складе',
  })
  moveStock(@Body() dto: MoveStockDto) {
    return this.inventoryService.moveStock(dto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Получить историю транзакций',
    description:
      'Возвращает полную историю всех операций с товарами на складе.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное возвращение всех транзакций',
  })
  getAll() {
    return this.inventoryService.getAllTransactions();
  }
}
