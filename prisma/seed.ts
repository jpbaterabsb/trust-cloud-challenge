import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function generateMasterCatalog() {
  await prisma.masterCatalog.upsert({
    where: {
      id: 1,
    },
    create: {
      description:
        'An outfit master catalog is a comprehensive collection of clothing and accessories offered by a fashion retailer or brand. It includes detailed descriptions, specifications, and pricing for each item, as well as high-quality images or videos to showcase the products.',
      name: 'Master Catalog',
      status: true,
    },
    update: {},
  });

  await prisma.masterProduct.upsert({
    where: {
      partNumber: 'A001',
    },
    create: {
      id: 1,
      partNumber: 'A001',
      name: 'Classic Black Dress',
      description: "A timeless black dress that's perfect for any occasion",
      price: 99.99,
      picture: 'https://example.com/classic-black-dress.jpg',
      status: true,
      masterCatalogId: 1,
    },
    update: {},
  });

  await prisma.masterProduct.upsert({
    where: {
      partNumber: 'A002',
    },
    create: {
      id: 2,
      partNumber: 'A002',
      name: 'Denim Jacket',
      description: "A versatile denim jacket that's perfect for layering",
      price: 79.99,
      picture: 'https://example.com/denim-jacket.jpg',
      status: true,
      masterCatalogId: 1,
    },
    update: {},
  });

  await prisma.masterProduct.upsert({
    where: {
      partNumber: 'A003',
    },
    create: {
      id: 3,
      partNumber: 'A003',
      name: 'Leather Boots',
      description: 'Stylish and durable leather boots that will last for years',
      price: 149.99,
      picture: 'https://example.com/leather-boots.jpg',
      status: true,
      masterCatalogId: 1,
    },
    update: {},
  });
}

async function generateOEM() {
  const oem1 = await prisma.oEM.upsert({
    where: {
      oemNumber: 'ACM-123',
    },
    create: {
      id: 1,
      name: 'Acme Corporation',
      oemNumber: 'ACM-123',
      url: 'https://acme.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: true,
    },
    update: {},
  });

  await prisma.catalog.upsert({
    where: {
      id: 1,
    },
    create: {
      name: 'OEM 1 Catalog 1',
      description: 'Catalog 1',
      OEM: {
        connect: {
          id: oem1.id,
        },
      },
      masterCatalog: {
        connect: { id: 1 },
      },
    },
    update: {},
  });

  await prisma.catalog.upsert({
    where: {
      id: 2,
    },
    create: {
      name: 'OEM 1 Catalog 2',
      description: 'Catalog 2',
      OEM: {
        connect: {
          id: oem1.id,
        },
      },
      masterCatalog: {
        connect: { id: 1 },
      },
    },
    update: {},
  });

  const oem2 = await prisma.oEM.upsert({
    where: {
      oemNumber: 'GLX-456',
    },
    create: {
      id: 2,
      name: 'Globex Industries',
      oemNumber: 'GLX-456',
      url: 'https://globex.example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
      status: true,
    },
    update: {},
  });

  await prisma.catalog.upsert({
    where: {
      id: 3,
    },
    create: {
      name: 'OEM 2 Catalog 1',
      description: 'Catalog 1',
      OEM: {
        connect: {
          id: oem2.id,
        },
      },
      masterCatalog: {
        connect: { id: 1 },
      },
    },
    update: {},
  });

  await prisma.catalog.upsert({
    where: {
      id: 4,
    },
    create: {
      name: 'OEM 2 Catalog 2',
      description: 'Catalog 2',
      OEM: {
        connect: {
          id: oem2.id,
        },
      },
      masterCatalog: {
        connect: { id: 1 },
      },
    },
    update: {},
  });
}

async function main() {
  await generateMasterCatalog();
  await generateOEM();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
