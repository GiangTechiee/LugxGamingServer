import { IsString, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  selected_game_ids: number[];

  @IsString()
  @IsOptional()
  promotion_code?: string;
}