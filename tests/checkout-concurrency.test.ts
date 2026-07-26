import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/checkout/route';

// Mock External Modules
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'concurrency-test-user-id', email: 'concurrency@test.com' },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === 'sessionId') return { value: 'concurrency-session-id' };
      return undefined;
    },
  }),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
  generateOrderEmailTemplate: vi.fn().mockReturnValue('<html></html>'),
}));

describe('Prueba de Concurrencia de Checkout con Pessimistic Locking', () => {
  let testProductId: string;
  let testVariantId: string;
  let categoryId: string;

  beforeAll(async () => {
    // 1. Setup mock Category
    const category = await prisma.category.upsert({
      where: { slug: 'test-concurrency-cat' },
      update: {},
      create: {
        name: 'Test Concurrency Cat',
        slug: 'test-concurrency-cat',
      },
    });
    categoryId = category.id;

    // 2. Setup mock User
    await prisma.user.upsert({
      where: { email: 'concurrency@test.com' },
      update: {},
      create: {
        id: 'concurrency-test-user-id',
        name: 'Concurrency Test User',
        email: 'concurrency@test.com',
        password: 'hashedpassword123',
      },
    });
  });

  it('debería procesar solo una orden y rechazar la otra ante solicitudes de checkout concurrentes por la última unidad', async () => {
    // 1. Create a product with exactly 1 unit of stock in its variant
    const product = await prisma.product.create({
      data: {
        name: 'Polo Concurrente',
        slug: 'polo-concurrente',
        description: 'Polo de prueba',
        price: 50.00,
        image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12',
        stock: 1,
        categoryId,
        variants: {
          create: [
            {
              size: 'M',
              color: 'Negro',
              stock: 1, // Last unit!
            },
          ],
        },
      },
      include: {
        variants: true,
      },
    });

    testProductId = product.id;
    testVariantId = product.variants[0].id;

    // 2. Setup an active cart for the user containing 1 quantity of the variant
    const cart = await prisma.cart.create({
      data: {
        userId: 'concurrency-test-user-id',
        status: 'ACTIVE',
        items: {
          create: [
            {
              productVariantId: testVariantId,
              quantity: 1,
              priceSnapshot: 50.00,
            },
          ],
        },
      },
    });

    // 3. Prepare two concurrent POST request payloads
    // We mock the Request object
    const createMockRequest = () => {
      return {
        headers: {
          get: (name: string) => {
            if (name === 'x-forwarded-for') return '127.0.0.1';
            return null;
          },
        },
        json: async () => ({
          total: 60.00,
          shippingCost: 10.00,
          documentType: 'DNI',
          documentNumber: '99887766',
        }),
      } as unknown as Request;
    };

    const req1 = createMockRequest();
    const req2 = createMockRequest();

    // 4. Trigger concurrent checkouts
    const [res1, res2] = await Promise.all([
      POST(req1),
      POST(req2),
    ]);

    const data1 = await res1.json();
    const data2 = await res2.json();

    // 5. Verify the results: one succeeds (status 200) and one fails (status 400)
    const successCount = [res1.status, res2.status].filter(status => status === 200).length;
    const failureCount = [res1.status, res2.status].filter(status => status === 400).length;

    expect(successCount).toBe(1);
    expect(failureCount).toBe(1);

    // One returns success, the other returns the "Stock insuficiente" or "El carrito está vacío" (since first request clears cart)
    const errors = [data1.error, data2.error];
    const hasInsufficientStockError = errors.some(err => err && (err.includes('Stock insuficiente') || err.includes('El carrito está vacío')));
    expect(hasInsufficientStockError).toBe(true);

    // 6. Verify variant stock is exactly 0 in database
    const updatedVariant = await prisma.productVariant.findUnique({
      where: { id: testVariantId },
    });
    expect(updatedVariant?.stock).toBe(0);

    // 7. Verify only 1 order has been created
    const orders = await prisma.order.findMany({
      where: { userId: 'concurrency-test-user-id' },
    });
    expect(orders.length).toBe(1);
  });

  afterAll(async () => {
    // Cleanup database records
    try {
      await prisma.orderItem.deleteMany({
        where: { variantId: testVariantId },
      });
      await prisma.order.deleteMany({
        where: { userId: 'concurrency-test-user-id' },
      });
      await prisma.cartItem.deleteMany({
        where: { productVariantId: testVariantId },
      });
      await prisma.cart.deleteMany({
        where: { userId: 'concurrency-test-user-id' },
      });
      await prisma.productVariant.deleteMany({
        where: { id: testVariantId },
      });
      await prisma.product.deleteMany({
        where: { id: testProductId },
      });
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  });
});
