import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('categories')
@ApiTags('Категории')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({
    summary: 'Создать новую категорию',
    description:
      'Создает новую категорию. Если она уже есть - вернет ошибку. При создании указывается название (name) и описание категории (description, опциональное поле)',
  })
  @ApiResponse({
    status: 201,
    description: 'Категория успешно создана',
  })
  @ApiResponse({
    status: 409,
    description: 'Такая категория уже есть',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав (только ADMIN)' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить все категории',
    description:
      'Возвращает список всех категорий. Каждая категория включает в себя список связанных продуктов.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное получение всех категорий',
  })
  @ApiResponse({
    status: 404,
    description: 'Категории не найдены',
  })
  getAll() {
    return this.categoriesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить категорию по ID',
    description:
      'Обновляет поля name и/или description у категории. Нужно передавать только то, что нужно изменить.',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно обновлена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить категорию по ID',
    description: 'Удаляет категорию по ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'Категория успешно удалена',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить категорию по ID',
    description:
      'Вовзращает одну категорию по ID вместе со списком ее продуктов.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешное получение категории по ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Категория не найдена',
  })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }
}
