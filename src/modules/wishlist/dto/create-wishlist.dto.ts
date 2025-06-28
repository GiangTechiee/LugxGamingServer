import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateWishlistDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  game_id: number;
}