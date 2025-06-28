import { IsString, IsOptional, IsNumber, IsArray, IsDateString, IsNotEmpty, IsBoolean, Length, Min } from 'class-validator';

class GameImageDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  url: string;

  @IsString()
  @IsOptional()
  @Length(1, 255)
  alt_text?: string;
}

export class UpdateGameDto {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  discount_price?: number;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  developer?: string;

  @IsString()
  @IsOptional()
  @Length(1, 100)
  publisher?: string;

  @IsDateString()
  @IsOptional()
  release_date?: string;

  @IsBoolean()
  @IsOptional()
  is_hot?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  genre_ids?: number[];

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  platform_ids?: number[];

  @IsArray()
  @IsOptional()
  image_urls?: GameImageDto[];
}