import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando base de datos Cryzan Sport...');

  // 1. Limpieza opcional
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
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
    },
  });

  const cliente = await prisma.user.create({
    data: {
      name: 'Cliente Prueba',
      email: 'cliente@cryzan.com',
      password: hashedPassword,
      role: Role.CLIENT,
    },
  });

  console.log('✅ Usuarios creados:', { admin: admin.email, cliente: cliente.email });

  // 3. Crear Categorías
  const catPolos = await prisma.category.create({
    data: { name: 'Polos', slug: 'polos' },
  });
  const catZapatillas = await prisma.category.create({
    data: { name: 'Zapatillas', slug: 'zapatillas' },
  });
  const catPelotas = await prisma.category.create({
    data: { name: 'Pelotas', slug: 'pelotas' },
  });
  const catCasacas = await prisma.category.create({
    data: { name: 'Casacas', slug: 'casacas' },
  });

  // 4. Crear Productos (basados en data.js rebrand a Cryzan Sport)
  const productosData = [
    {
      name: 'Polo Deportivo Cryzan',
      slug: 'polo-deportivo-cryzan',
      description: 'Polo técnico transpirable de alta rendimiento para deportes intensos.',
      price: 59.90,
      image: '/img/productos/polo.jpeg',
      stock: 45,
      categoryId: catPolos.id,
    },
    {
      name: 'Zapatillas Running Cryzan Pro',
      slug: 'zapatillas-running-cryzan-pro',
      description: 'Zapatillas de amortiguación avanzada para atletismo y running.',
      price: 189.90,
      image: '/img/productos/zapatillas.jpeg',
      stock: 30,
      categoryId: catZapatillas.id,
    },
    {
      name: 'Pelota Profesional Cryzan Match',
      slug: 'pelota-profesional-cryzan-match',
      description: 'Balón oficial de fútbol con costuras termoselladas y excelente agarre.',
      price: 79.90,
      image: '/img/productos/pelota.jpeg',
      stock: 60,
      categoryId: catPelotas.id,
    },
    {
      name: 'Casaca Deportiva Cryzan Windbreak',
      slug: 'casaca-deportiva-cryzan-windbreak',
      description: 'Casaca rompevientos ligera con tecnología impermeabilizante.',
      price: 129.90,
      image: '/img/productos/casaca.jpeg',
      stock: 25,
      categoryId: catCasacas.id,
    },
  ];

  for (const prod of productosData) {
    await prisma.product.create({ data: prod });
  }

  console.log('✅ Productos e imágenes sembrados con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
