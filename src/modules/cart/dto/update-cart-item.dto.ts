import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCartItemDto {
  @IsNumber()
  @IsOptional()
  game_id?: number;
}