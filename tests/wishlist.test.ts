import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { POST as togglePOST } from '@/app/api/wishlist/toggle/route';
import { GET as getWishlist } from '@/app/api/wishlist/route';
import { GET as shareGET } from '@/app/api/wishlist/share/[shareId]/route';
import { updateProductVariantStock } from '@/lib/inventory';
import { processWishlistPriceAlert } from '@/lib/wishlist-alerts';

// Mock session and headers
vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: { id: 'wishlist-test-user-id', email: 'wishlist@test.com' },
  }),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: (name: string) => {
      if (name === 'sessionId') return { value: 'wishlist-session-id' };
      return undefined;
    },
  }),
}));

async function isDbConnected(): Promise<boolean> {
  try {
    await prisma.category.findFirst();
    return true;
  } catch (error) {
    return false;
  }
}

describe('Pruebas de Integración y Lógica de Wishlist', () => {
  let testProductId: string;
  let testVariantId: string;
  let categoryId: string;
  let dbAvailable = false;

  beforeAll(async () => {
    dbAvailable = await isDbConnected();
    if (!dbAvailable) {
      console.warn('⚠️ Base de datos no disponible. Omitiendo pruebas de wishlist de base de datos.');
      return;
    }

    // 1. Setup mock Category
    const category = await prisma.category.upsert({
      where: { slug: 'test-wishlist-cat' },
      update: {},
      create: {
        name: 'Test Wishlist Cat',
        slug: 'test-wishlist-cat',
      },
    });
    categoryId = category.id;

    // 2. Setup mock User
    await prisma.user.upsert({
      where: { email: 'wishlist@test.com' },
      update: {},
      create: {
        id: 'wishlist-test-user-id',
        name: 'Wishlist Test User',
        email: 'wishlist@test.com',
        password: 'hashedpassword123',
        wishlistShareId: 'test-share-slug-token-123',
      },
    });

    // 3. Setup mock Product and Variant with 0 stock to test stock alert later
    const product = await prisma.product.create({
      data: {
        name: 'Polo Wishlist Test',
        slug: 'polo-wishlist-test',
        description: 'Polo de prueba favoritos',
        price: 49.90,
        image: '/img/productos/polo.jpeg',
        stock: 0,
        categoryId,
        variants: {
          create: [
            {
              size: 'L',
              color: 'Azul',
              stock: 0, // Out of stock initially
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
  });

  afterAll(async () => {
    if (!dbAvailable) return;

    // Clean up
    try {
      await prisma.wishlist.deleteMany({ where: { userId: 'wishlist-test-user-id' } });
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.product.deleteMany({ where: { id: testProductId } });
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
  });

  it('debería agregar un producto a favoritos y luego quitarlo usando el toggle API', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    // 1. Mock Request for toggle (Add to wishlist)
    const reqAdd = new Request('http://localhost:3000/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId: testProductId, variantId: testVariantId }),
    });

    const resAdd = await togglePOST(reqAdd);
    const jsonAdd = await resAdd.json();

    expect(resAdd.status).toBe(200);
    expect(jsonAdd.added).toBe(true);

    // Verify it exists in DB
    const wishlistItem = await prisma.wishlist.findFirst({
      where: { userId: 'wishlist-test-user-id', productId: testProductId },
    });
    expect(wishlistItem).toBeDefined();
    expect(wishlistItem!.variantId).toBe(testVariantId);

    // 2. Mock Request for toggle again (Remove from wishlist)
    const reqRemove = new Request('http://localhost:3000/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId: testProductId, variantId: testVariantId }),
    });

    const resRemove = await togglePOST(reqRemove);
    const jsonRemove = await resRemove.json();

    expect(resRemove.status).toBe(200);
    expect(jsonRemove.added).toBe(false);

    // Verify it no longer exists in DB
    const wishlistItemRemoved = await prisma.wishlist.findFirst({
      where: { userId: 'wishlist-test-user-id', productId: testProductId },
    });
    expect(wishlistItemRemoved).toBeNull();
  });

  it('debería consultar la lista pública compartida usando el shareId', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    // 1. Add to wishlist
    const reqAdd = new Request('http://localhost:3000/api/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId: testProductId, variantId: testVariantId }),
    });
    await togglePOST(reqAdd);

    // 2. Query shared route
    const resShare = await shareGET(
      new Request('http://localhost:3000/api/wishlist/share/test-share-slug-token-123'),
      { params: { shareId: 'test-share-slug-token-123' } }
    );
    const jsonShare = await resShare.json();

    expect(resShare.status).toBe(200);
    expect(jsonShare.ownerName).toBe('Wishlist Test User');
    expect(jsonShare.items.length).toBe(1);
    expect(jsonShare.items[0].product.name).toBe('Polo Wishlist Test');
  });

  it('debería disparar alerta de stock cuando la variante vuelve a tener stock (>0)', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const consoleSpy = vi.spyOn(console, 'log');

    // 1. Change stock from 0 to 10
    await updateProductVariantStock(testVariantId, 10);

    // 2. Verify alert output has been printed to console logs
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WEBPUSH WISHLIST STOCK ALERT]')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('vuelve a estar disponible. Stock actual: 10 unidades')
    );

    consoleSpy.mockRestore();
  });

  it('debería disparar alerta de precio si el precio del producto disminuye', async (ctx) => {
    if (!dbAvailable) {
      ctx.skip();
      return;
    }

    const consoleSpy = vi.spyOn(console, 'log');

    // 1. Verify current wishlist item has priceAtAdd = 49.90
    const itemBefore = await prisma.wishlist.findFirst({
      where: { userId: 'wishlist-test-user-id', productId: testProductId },
    });
    expect(itemBefore!.priceAtAdd).toBe(49.90);

    // 2. Change product price from 49.90 to 39.90 (discount!)
    await prisma.product.update({
      where: { id: testProductId },
      data: { price: 39.90 },
    });

    // 3. Process price alerts
    await processWishlistPriceAlert();

    // 4. Verify alert output
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[WEBPUSH WISHLIST PRICE ALERT]')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('bajó de precio de S/. 49.90 a S/. 39.90')
    );

    // 5. Verify priceAtAdd has been updated to 39.90
    const itemAfter = await prisma.wishlist.findFirst({
      where: { userId: 'wishlist-test-user-id', productId: testProductId },
    });
    expect(itemAfter!.priceAtAdd).toBe(39.90);

    consoleSpy.mockRestore();
  });
});
