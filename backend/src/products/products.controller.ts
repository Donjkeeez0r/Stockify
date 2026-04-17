import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@ApiTags('Продукты')
export class ProductsController {
  constructor(private productService: ProductsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Создать новый продукт в категории',
    description:
      'Создаёт новый продукт и привязывает его к существующей категории. При создании нужно будет указать: name, quantity, price, categoryId',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное создание продукта в категории',
  })
  @ApiResponse({
    status: 404,
    description:
      'Не удалось создать продукт в данной категории, так как категория не найдена',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав (только ADMIN)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список продуктов',
    description:
      'Возвращает список продуктов с пагинацией (skip, take). Можно отфильтровать по categoryId. По умолчанию возвращает первые 10 продуктов.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное получение всех всех продуктов',
  })
  @ApiResponse({
    status: 404,
    description: 'Продукты не найдены',
  })
  findAll(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить продукт по ID',
    description: 'Возвращает продукт вместе с категорией.',
  })
  @ApiResponse({ status: 200, description: 'Успешное получение продукта' })
  @ApiResponse({ status: 404, description: 'Продукт не найден' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить продукт по ID',
    description: 'Обновляет поля продукта (name, quantity, price, categoryId).',
  })
  @ApiResponse({ status: 200, description: 'Продукт успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Продукт или категория не найдены' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить продукт по ID',
    description: 'Удаляет продукт из системы.',
  })
  @ApiResponse({ status: 200, description: 'Продукт успешно удален' })
  @ApiResponse({ status: 404, description: 'Продукт не найден' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.productService.deleteProduct(id);
  }
}
