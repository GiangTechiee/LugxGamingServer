import { IsNumber, IsOptional } from 'class-validator';

export class UpdateWishlistDto {
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @IsNumber()
  @IsOptional()
  game_id?: number;
}