import { IsNumber, IsNotEmpty, IsOptional, IsString, Min, Max, Length } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  game_id: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  comment?: string;
}