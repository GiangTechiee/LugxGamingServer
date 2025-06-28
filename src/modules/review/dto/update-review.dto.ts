import { IsNumber, IsOptional, IsString, Min, Max, Length } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  @Length(1, 500)
  comment?: string;
}