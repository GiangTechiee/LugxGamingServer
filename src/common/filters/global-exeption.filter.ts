import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ErrorResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];

    // Xử lý HTTP Exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        const errorObj = exceptionResponse as ErrorResponse;
        message = errorObj.message || 'HTTP error occurred';
      }

      // Log HTTP errors (warn level cho client errors, error level cho server errors)
      if (status >= 500) {
        this.logger.error(
          `HTTP Exception: ${status} - ${JSON.stringify(message)}`,
          exception.stack,
          `${request.method} ${request.url}`,
        );
      } else {
        this.logger.warn(
          `HTTP Exception: ${status} - ${JSON.stringify(message)}`,
          `${request.method} ${request.url}`,
        );
      }
    }
    // Xử lý Prisma Database Errors
    else if (exception instanceof PrismaClientKnownRequestError) {
      ({ status, message } = this.handlePrismaError(exception));

      this.logger.error(
        `Prisma Exception: ${exception.code} - ${message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );
    }
    // Xử lý các lỗi không xác định khác
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';

      this.logger.error(
        `Unhandled Exception: ${exception}`,
        exception instanceof Error
          ? exception.stack
          : 'No stack trace available',
        `${request.method} ${request.url}`,
      );
    }

    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(exception: PrismaClientKnownRequestError): {
    status: number;
    message: string;
  } {
    switch (exception.code) {
      // Unique constraint violation
      case 'P2002': {
        const target = exception.meta?.target as string[] | string;
        const field = Array.isArray(target) ? target.join(', ') : target;
        return {
          status: HttpStatus.CONFLICT,
          message: `Duplicate value for field(s): ${field || 'unknown'}`,
        };
      }

      // Record not found
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        };

      // Foreign key constraint failed
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint failed',
        };

      // Invalid ID (e.g., invalid UUID format)
      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid ID provided',
        };

      // Table does not exist
      case 'P2021':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Table does not exist',
        };

      // Column does not exist
      case 'P2022':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Column does not exist',
        };

      // Record required but not found
      case 'P2018':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Required record not found',
        };

      // Value too long for column
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Value too long for database column',
        };

      // Value out of range
      case 'P2001':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Value out of range for database column',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error occurred',
        };
    }
  }
}
