import { Inject, Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/access.decorator.js';

@Controller()
export class AppController {
  constructor(@Inject(AppService) private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  health() {
    return { status: 'ok' };
  }
}
