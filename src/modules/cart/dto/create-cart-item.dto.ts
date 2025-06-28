import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateCartItemDto {
  @IsNumber()
  @IsNotEmpty()
  game_id: number;
}