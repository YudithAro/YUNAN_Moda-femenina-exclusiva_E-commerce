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
    const revision = process.env.RENDER_GIT_COMMIT;
    return { status: 'ok', ...(/^[a-f0-9]{40}$/i.test(revision || '') ? { revision } : {}) };
  }
}
