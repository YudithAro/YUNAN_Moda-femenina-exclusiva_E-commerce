import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const dbCode = (error as { code?: string })?.code;
    let status = 500;
    let message: string | string[] = 'No pudimos completar la operación. Inténtalo nuevamente.';
    if (error instanceof HttpException) {
      status = error.getStatus();
      const body = error.getResponse();
      message = typeof body === 'string' ? body : (body as { message?: string | string[] }).message || message;
    } else if (dbCode === '23505') {
      status = 409;
      message = 'Ya existe un registro con esos datos.';
    } else if (dbCode === '23503') {
      status = 409;
      message = 'Este registro está asociado a otros datos y no se puede eliminar.';
    } else if (dbCode === '22P02' || dbCode === '23514') {
      status = 400;
      message = 'Revisa los datos enviados.';
    } else {
      // Do not return or log SQL, tokens, connection strings or request bodies.
      this.logger.error(`Operación fallida (${dbCode || (error instanceof Error ? error.name : 'unknown')}).`);
    }
    response.status(status).json({ statusCode: status, message });
  }
}
