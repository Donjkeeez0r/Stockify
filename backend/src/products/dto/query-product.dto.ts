import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  skip?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  take?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoryId?: number;
}
