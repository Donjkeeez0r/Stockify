import { TransactionType } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class MoveStockDto {
  @IsInt()
  productId: number;

  @IsInt()
  userId: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  comment?: string;
}
