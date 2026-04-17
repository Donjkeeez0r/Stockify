import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prismaService: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prismaService.category.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Такая категория уже есть!');
    }

    return this.prismaService.category.create({
      data: { name: dto.name, description: dto.description },
    });
  }

  async findAll() {
    return this.prismaService.category.findMany({
      include: { products: true },
    });
  }

  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new NotFoundException(`Категория с ID: ${id} не найдена!`);
    }

    return category;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    await this.findOne(id);

    return this.prismaService.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async deleteCategory(id: number) {
    await this.findOne(id);

    return this.prismaService.category.delete({ where: { id } });
  }
}
