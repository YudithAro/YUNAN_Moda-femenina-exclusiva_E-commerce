import { Test } from '@nestjs/testing';
import { type INestApplication, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { AuthService } from '../src/auth/auth.service.js';
import { ProductsService } from '../src/products/products.service.js';
import { CategoriesService } from '../src/categories/categories.service.js';
import { OrdersService } from '../src/orders/orders.service.js';
import { UsersService } from '../src/users/users.service.js';
import { HttpErrorFilter } from '../src/http-error.filter.js';

describe('API access boundaries (no database or external calls)', () => {
  let app: INestApplication;
  const products = { findAll: vi.fn(() => []), create: vi.fn(() => ({ id: 'new' })) };
  const user = { id: 'customer', email: 'client@example.com', name: 'Client', role: 'USER' };
  const auth = {
    verifyToken: vi.fn(async (token: string) => {
      if (token === 'admin') return { ...user, role: 'ADMIN' };
      if (token === 'customer') return user;
      throw new UnauthorizedException();
    }),
    syncUser: vi.fn(async (identity: unknown) => ({ success: true, user: identity })),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AuthService).useValue(auth)
      .overrideProvider(ProductsService).useValue(products)
      .overrideProvider(CategoriesService).useValue({ findAll: () => [] })
      .overrideProvider(OrdersService).useValue({ findAll: () => [] })
      .overrideProvider(UsersService).useValue({ findAll: () => [] })
      .compile();
    app = module.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('keeps health and catalog public', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
    await request(app.getHttpServer()).get('/products').expect(200, []);
    await request(app.getHttpServer()).get('/categories').expect(200, []);
  });

  it('denies unauthenticated product writes and private reads', async () => {
    await request(app.getHttpServer()).post('/products').send({}).expect(401);
    await request(app.getHttpServer()).get('/orders').expect(401);
    await request(app.getHttpServer()).get('/users').expect(401);
    await request(app.getHttpServer()).get('/products/low-stock').expect(401);
  });

  it('denies customer product writes, orders and uploads', async () => {
    await request(app.getHttpServer()).post('/products').set('Authorization', 'Bearer customer').send({}).expect(403);
    await request(app.getHttpServer()).get('/orders').set('Authorization', 'Bearer customer').expect(403);
    await request(app.getHttpServer()).post('/products/upload').set('Authorization', 'Bearer customer').expect(403);
  });

  it('allows an admin product write', async () => {
    await request(app.getHttpServer()).post('/products').set('Authorization', 'Bearer admin').send({ name: 'Dress' }).expect(201, { id: 'new' });
  });

  it('protects profile synchronization and ignores spoofed identities', async () => {
    await request(app.getHttpServer()).post('/auth/sync-user').send({ id: 'victim' }).expect(401);
    await request(app.getHttpServer()).post('/auth/sync-user').set('Authorization', 'Bearer customer')
      .send({ id: 'victim', email: 'victim@example.com', role: 'ADMIN' }).expect(200, { success: true, user });
    await request(app.getHttpServer()).get('/auth/me').set('Authorization', 'Bearer customer').expect(200, user);
  });

  it('rejects unsupported uploads before touching storage', async () => {
    await request(app.getHttpServer()).post('/products/upload').set('Authorization', 'Bearer admin')
      .attach('image', Buffer.from('<script>alert(1)</script>'), { filename: 'test.svg', contentType: 'image/svg+xml' }).expect(400);
    await request(app.getHttpServer()).post('/products/upload').set('Authorization', 'Bearer admin')
      .attach('image', Buffer.from('not an image'), { filename: 'test.png', contentType: 'image/png' }).expect(400);
  });
});
