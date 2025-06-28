import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsNumber()
  discount_value: number;

  @IsNumber()
  @IsOptional()
  minimum_order?: number;

  @IsDateString()
  @IsOptional()
  start_date?: string;

  @IsDateString()
  @IsOptional()
  end_date?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}