import { IsNumber, IsNotEmpty, IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  order_id: number;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  payment_method: PaymentMethod;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsEnum(PaymentStatus)
  @IsNotEmpty()
  status: PaymentStatus;

  @IsDateString()
  @IsOptional()
  payment_date?: string;

  @IsString()
  @IsOptional()
  failure_reason?: string;
}