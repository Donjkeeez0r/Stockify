import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const existing = await this.prismaService.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Категория с ID: ${dto.categoryId} не найдена!`,
      );
    }

    return this.prismaService.product.create({ data: dto });
  }

  async findAll(dto: QueryProductDto) {
    const { skip = 0, take = 10, categoryId } = dto;
    const where = categoryId ? { categoryId } : {};
    const [items, total] = await Promise.all([
      this.prismaService.product.findMany({
        where,
        skip,
        take,
        include: { category: true },
      }),
      this.prismaService.product.count({
        where,
      }),
    ]);

    return { data: items, meta: { total, skip, take } };
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Продукт с ID: ${id} не найден!`);
    }

    return product;
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    await this.findOne(id);

    if (dto.categoryId) {
      const category = await this.prismaService.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Категория с ID: ${dto.categoryId} не найдена!`,
        );
      }
    }

    return this.prismaService.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async deleteProduct(id: number) {
    await this.findOne(id);
    return this.prismaService.product.delete({ where: { id } });
  }
}
