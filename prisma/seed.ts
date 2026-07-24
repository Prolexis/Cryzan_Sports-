import { PrismaClient, Role, OrderStatus, DiscountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos de producción Cryzan Sport...');

  // 1. Limpieza
  await prisma.featureFlag.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.giftCard.deleteMany({});
  await prisma.refundRequest.deleteMany({});
  await prisma.referral.deleteMany({});
  await prisma.loyaltyPoint.deleteMany({});
  await prisma.abandonedCart.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Crear Usuarios
  const hashedPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador Cryzan',
      email: 'admin@cryzan.com',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '+51 999 888 777',
    },
  });

  const cliente = await prisma.user.create({
    data: {
      name: 'Carlos Mendoza',
      email: 'cliente@cryzan.com',
      password: hashedPassword,
      role: Role.CLIENT,
      phone: '+51 987 654 321',
      referralCode: 'CARLOS2026',
    },
  });

  // 3. Crear Puntos de Fidelidad
  await prisma.loyaltyPoint.create({
    data: {
      userId: cliente.id,
      points: 25,
    },
  });

  // 4. Crear Dirección
  const direccionCliente = await prisma.address.create({
    data: {
      userId: cliente.id,
      street: 'Av. Larco 1234, Urb. California',
      city: 'Trujillo',
      province: 'La Libertad',
      postalCode: '13008',
      phone: '+51 987 654 321',
      isDefault: true,
    },
  });

  // 5. Crear Categorías
  const catPolos = await prisma.category.create({ data: { name: 'Polos', slug: 'polos' } });
  const catZapatillas = await prisma.category.create({ data: { name: 'Zapatillas', slug: 'zapatillas' } });
  const catPelotas = await prisma.category.create({ data: { name: 'Pelotas', slug: 'pelotas' } });
  const catCasacas = await prisma.category.create({ data: { name: 'Casacas', slug: 'casacas' } });

  // 6. Crear Productos con Variantes

  // POLOS
  const polo = await prisma.product.create({
    data: {
      name: 'Polo Deportivo Cryzan Pro',
      slug: 'polo-deportivo-cryzan-pro',
      description: 'Polo técnico de alto rendimiento con tecnología Dri-Fit transpirable, costuras reforzadas y protección UV.',
      price: 59.90,
      image: '/img/productos/polo.jpeg',
      images: ['/img/productos/polo.jpeg'],
      stock: 40,
      categoryId: catPolos.id,
      variants: {
        create: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 15 },
          { size: 'L', stock: 10 },
          { size: 'XL', stock: 5 },
        ],
      },
    },
  });

  const poloActive = await prisma.product.create({
    data: {
      name: 'Polo Técnico Cryzan Active',
      slug: 'polo-tecnico-cryzan-active',
      description: 'Polo transpirable ultraligero diseñado para entrenamiento intenso en climas cálidos.',
      price: 49.90,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop'],
      stock: 35,
      categoryId: catPolos.id,
      variants: {
        create: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 15 },
        ],
      },
    },
  });

  const poloElite = await prisma.product.create({
    data: {
      name: 'Polo de Competición Cryzan Elite',
      slug: 'polo-de-competicion-cryzan-elite',
      description: 'Polo de compresión premium ideal para running y ciclismo, con detalles reflectantes.',
      price: 69.90,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop'],
      stock: 30,
      categoryId: catPolos.id,
      variants: {
        create: [
          { size: 'M', stock: 15 },
          { size: 'L', stock: 15 },
        ],
      },
    },
  });

  const poloCore = await prisma.product.create({
    data: {
      name: 'Polo Entrenamiento Cryzan Core',
      slug: 'polo-entrenamiento-cryzan-core',
      description: 'Polo de algodón peinado de alta densidad y durabilidad para gimnasio y uso casual.',
      price: 39.90,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop'],
      stock: 50,
      categoryId: catPolos.id,
      variants: {
        create: [
          { size: 'S', stock: 15 },
          { size: 'M', stock: 20 },
          { size: 'L', stock: 15 },
        ],
      },
    },
  });

  // ZAPATILLAS
  const zapatillas = await prisma.product.create({
    data: {
      name: 'Zapatillas Running Cryzan Speed',
      slug: 'zapatillas-running-cryzan-speed',
      description: 'Zapatillas ultraligeras de amortiguación responsiva para maratones y running urbano.',
      price: 189.90,
      image: '/img/productos/zapatillas.jpeg',
      images: ['/img/productos/zapatillas.jpeg'],
      stock: 30,
      categoryId: catZapatillas.id,
      variants: {
        create: [
          { size: '39', stock: 5 },
          { size: '40', stock: 10 },
          { size: '41', stock: 10 },
          { size: '42', stock: 5 },
        ],
      },
    },
  });

  const zapatillasTerra = await prisma.product.create({
    data: {
      name: 'Zapatillas Trail Cryzan Terra',
      slug: 'zapatillas-trail-cryzan-terra',
      description: 'Calzado todoterreno con suela dentada de alta tracción y protección impermeable para montaña.',
      price: 219.90,
      image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop'],
      stock: 25,
      categoryId: catZapatillas.id,
      variants: {
        create: [
          { size: '40', stock: 8 },
          { size: '41', stock: 10 },
          { size: '42', stock: 7 },
        ],
      },
    },
  });

  const zapatillasFit = await prisma.product.create({
    data: {
      name: 'Zapatillas de Entrenamiento Cryzan Fit',
      slug: 'zapatillas-de-entrenamiento-cryzan-fit',
      description: 'Zapatillas estables con suela plana de goma ideales para levantamiento de pesas y crossfit.',
      price: 179.90,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop'],
      stock: 35,
      categoryId: catZapatillas.id,
      variants: {
        create: [
          { size: '39', stock: 10 },
          { size: '40', stock: 15 },
          { size: '41', stock: 10 },
        ],
      },
    },
  });

  const zapatillasCourt = await prisma.product.create({
    data: {
      name: 'Zapatillas Indoor Cryzan Court',
      slug: 'zapatillas-indoor-cryzan-court',
      description: 'Zapatillas con suela de liga antideslizante para futsal, voleibol o balonmano en parqué.',
      price: 159.90,
      image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop'],
      stock: 20,
      categoryId: catZapatillas.id,
      variants: {
        create: [
          { size: '40', stock: 10 },
          { size: '41', stock: 10 },
        ],
      },
    },
  });

  // PELOTAS
  const pelota = await prisma.product.create({
    data: {
      name: 'Pelota Profesional Cryzan Match',
      slug: 'pelota-profesional-cryzan-match',
      description: 'Balón oficial de fútbol 11 termosellado con certificación FIFA Quality.',
      price: 79.90,
      image: '/img/productos/pelota.jpeg',
      images: ['/img/productos/pelota.jpeg'],
      stock: 50,
      categoryId: catPelotas.id,
      variants: {
        create: [{ size: 'Estándar (#5)', stock: 50 }],
      },
    },
  });

  const pelotaClub = await prisma.product.create({
    data: {
      name: 'Pelota de Entrenamiento Cryzan Club',
      slug: 'pelota-de-entrenamiento-cryzan-club',
      description: 'Balón de fútbol cosido a máquina con alta retención de aire para prácticas diarias.',
      price: 49.90,
      image: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&auto=format&fit=crop'],
      stock: 60,
      categoryId: catPelotas.id,
      variants: {
        create: [{ size: 'Estándar (#5)', stock: 60 }],
      },
    },
  });

  const pelotaSala = await prisma.product.create({
    data: {
      name: 'Pelota de Futsal Cryzan Sala',
      slug: 'pelota-de-futsal-cryzan-sala',
      description: 'Balón de rebote controlado con cubierta de poliuretano texturizado para canchas de losa.',
      price: 59.90,
      image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop'],
      stock: 45,
      categoryId: catPelotas.id,
      variants: {
        create: [{ size: 'Futsal (#4)', stock: 45 }],
      },
    },
  });

  const pelotaClassic = await prisma.product.create({
    data: {
      name: 'Pelota Retro Cryzan Classic',
      slug: 'pelota-retro-cryzan-classic',
      description: 'Balón vintage de cuero genuino inspirado en los diseños clásicos de los años 80.',
      price: 99.90,
      image: 'https://images.unsplash.com/photo-1517747614396-d21a78b850e8?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1517747614396-d21a78b850e8?w=600&auto=format&fit=crop'],
      stock: 15,
      categoryId: catPelotas.id,
      variants: {
        create: [{ size: 'Estándar (#5)', stock: 15 }],
      },
    },
  });

  // CASACAS
  const casaca = await prisma.product.create({
    data: {
      name: 'Casaca Rompevientos Cryzan Wind',
      slug: 'casaca-rompevientos-cryzan-wind',
      description: 'Casaca técnica impermeable y ultraligera para entrenamiento en clima frío.',
      price: 129.90,
      image: '/img/productos/casaca.jpeg',
      images: ['/img/productos/casaca.jpeg'],
      stock: 20,
      categoryId: catCasacas.id,
      variants: {
        create: [
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
        ],
      },
    },
  });

  const casacaWarm = await prisma.product.create({
    data: {
      name: 'Casaca Térmica Cryzan Warm',
      slug: 'casaca-termica-cryzan-warm',
      description: 'Casaca térmica acolchada de plumas sintéticas con aislamiento térmico superior.',
      price: 179.90,
      image: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop'],
      stock: 25,
      categoryId: catCasacas.id,
      variants: {
        create: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
        ],
      },
    },
  });

  const casacaShield = await prisma.product.create({
    data: {
      name: 'Casaca Impermeable Cryzan Shield',
      slug: 'casaca-impermeable-cryzan-shield',
      description: 'Casaca deportiva 100% impermeable con capucha ajustable y costuras termoselladas.',
      price: 159.90,
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop'],
      stock: 18,
      categoryId: catCasacas.id,
      variants: {
        create: [
          { size: 'M', stock: 8 },
          { size: 'L', stock: 10 },
        ],
      },
    },
  });

  const casacaTrack = await prisma.product.create({
    data: {
      name: 'Casaca Deportiva Cryzan Track',
      slug: 'casaca-deportiva-cryzan-track',
      description: 'Casaca clásica de algodón y poliéster para entrenamiento al aire libre y calentamientos.',
      price: 119.90,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop'],
      stock: 30,
      categoryId: catCasacas.id,
      variants: {
        create: [
          { size: 'S', stock: 10 },
          { size: 'M', stock: 10 },
          { size: 'L', stock: 10 },
        ],
      },
    },
  });

  // 7. Crear Cupones
  await prisma.coupon.create({
    data: {
      code: 'CRYZAN15',
      discountType: DiscountType.PERCENTAGE,
      value: 15,
      expirationDate: new Date('2026-12-31'),
      maxUses: 100,
    },
  });

  // 8. Feature Flags
  await prisma.featureFlag.create({
    data: { key: 'HERO_BANNER_VARIANT_B', isEnabled: false },
  });

  await prisma.featureFlag.create({
    data: { key: 'RECOMMENDATIONS_MODULE', isEnabled: true },
  });

  // 9. Crear Órdenes de prueba con Tracking
  await prisma.order.create({
    data: {
      userId: cliente.id,
      addressId: direccionCliente.id,
      total: 249.80,
      shippingCost: 0,
      documentType: 'DNI',
      documentNumber: '47586932',
      trackingNumber: 'OLVA-99887766',
      carrier: 'Olva Courier',
      status: OrderStatus.DELIVERED,
      items: {
        create: [
          { productId: zapatillas.id, price: 189.90, quantity: 1 },
          { productId: polo.id, price: 59.90, quantity: 1 },
        ],
      },
    },
  });

  console.log('✅ Datos sembrados con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
