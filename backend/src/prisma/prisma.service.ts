import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PrismaService implements OnModuleInit {
  user: any = {
    findUnique: async () => null,
    create: async (data: any) => data.data,
  };
  async onModuleInit() {
    // await this.$connect();
  }
}
