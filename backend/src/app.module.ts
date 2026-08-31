import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { CouponsModule } from './coupons/coupons.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CouponsModule,
    SuppliersModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
