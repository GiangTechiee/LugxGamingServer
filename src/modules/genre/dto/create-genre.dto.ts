import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateGenreDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 50, { message: 'Tên thể loại phải từ 1 đến 50 ký tự' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}