import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log("Start seeding ...");

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      name: "Admin",
      role: "ADMIN",
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create a regular user
  const userPasswordHash = await bcrypt.hash("password123", SALT_ROUNDS);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      passwordHash: userPasswordHash,
      name: "Test User",
      role: "USER",
    },
  });
  console.log(`Created user: ${user.email}`);

  // Create restaurants with categories and menu items
  const restaurantsData = [
    { name: "Burger King", description: "Fast Food", latitude: 10.762622, longitude: 106.660172 },
    { name: "Sushi Palace", description: "Japanese", latitude: 10.763622, longitude: 106.661172 },
    { name: "Pasta House", description: "Italian", latitude: 10.764622, longitude: 106.662172 },
    { name: "Taco Fiesta", description: "Mexican", latitude: 10.765622, longitude: 106.663172 },
    { name: "Curry Corner", description: "Indian", latitude: 10.766622, longitude: 106.664172 },
  ];

  const createdRestaurants: { id: string; menuItemIds: string[] }[] = [];

  for (const r of restaurantsData) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: r.name,
        description: r.description,
        latitude: r.latitude,
        longitude: r.longitude,
        isActive: true,
        categories: {
          create: [
            {
              name: `${r.name} - Main`,
              sortOrder: 0,
              isActive: true,
              menuItems: {
                create: [
                  { name: "Special", description: "Chef recommended", price: 15.99, isAvailable: true },
                  { name: "Drink", description: "Soft drink", price: 2.99, isAvailable: true },
                ],
              },
            },
          ],
        },
      },
      include: {
        categories: {
          include: { menuItems: true },
        },
      },
    });
    const menuItemIds = restaurant.categories.flatMap((c) => c.menuItems.map((m) => m.id));
    createdRestaurants.push({ id: restaurant.id, menuItemIds });
    console.log(`Created restaurant: ${restaurant.name}`);
  }

  // User addresses (idempotent: create only if none exist for user)
  const existingUserAddresses = await prisma.userAddress.count({
    where: { userId: user.id },
  });
  if (existingUserAddresses === 0) {
    await prisma.userAddress.createMany({
      data: [
        {
          userId: user.id,
          address: "123 Main St, District 1",
          latitude: 10.776622,
          longitude: 106.670172,
          isDefault: true,
        },
        {
          userId: user.id,
          address: "456 Oak Ave, District 2",
          latitude: 10.786622,
          longitude: 106.680172,
          isDefault: false,
        },
      ],
    });
    console.log("Created user addresses for test user");
  }

  const existingAdminAddresses = await prisma.userAddress.count({
    where: { userId: admin.id },
  });
  if (existingAdminAddresses === 0) {
    await prisma.userAddress.create({
      data: {
        userId: admin.id,
        address: "Admin Office, HQ",
        latitude: 10.772622,
        longitude: 106.665172,
        isDefault: true,
      },
    });
    console.log("Created admin address");
  }

  // Sample orders for user (only if user has no orders yet)
  const existingOrdersCount = await prisma.order.count({
    where: { userId: user.id },
  });
  const firstRestaurant = createdRestaurants[0];
  if (
    existingOrdersCount === 0 &&
    firstRestaurant &&
    firstRestaurant.menuItemIds.length >= 2
  ) {
    const [menuItemId1, menuItemId2] = firstRestaurant.menuItemIds;
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: [menuItemId1, menuItemId2] } },
    });
    const price1 = Number(menuItems[0]?.price ?? 15.99);
    const price2 = Number(menuItems[1]?.price ?? 2.99);
    const subtotal = price1 * 2 + price2 * 1;
    const deliveryFee = 3.5;
    const totalPrice = subtotal + deliveryFee;

    const order1 = await prisma.order.create({
      data: {
        userId: user.id,
        restaurantId: firstRestaurant.id,
        status: "COMPLETED",
        totalPrice,
        deliveryFee,
        paymentStatus: "PAID",
        orderItems: {
          create: [
            { menuItemId: menuItemId1, quantity: 2, price: price1 },
            { menuItemId: menuItemId2, quantity: 1, price: price2 },
          ],
        },
        statusHistory: {
          create: [
            { status: "PENDING", changedBy: user.id },
            { status: "CONFIRMED", changedBy: admin.id },
            { status: "PREPARING", changedBy: admin.id },
            { status: "ON_THE_WAY", changedBy: admin.id },
            { status: "COMPLETED", changedBy: admin.id },
          ],
        },
        payments: {
          create: {
            provider: "STRIPE",
            amount: totalPrice,
            status: "PAID",
            transactionId: "txn_seed_demo_001",
          },
        },
      },
    });
    console.log(`Created completed order: ${order1.id}`);

    const order2 = await prisma.order.create({
      data: {
        userId: user.id,
        restaurantId: firstRestaurant.id,
        status: "PENDING",
        totalPrice: 18.98 + 2,
        deliveryFee: 2,
        paymentStatus: "PENDING",
        orderItems: {
          create: [
            { menuItemId: menuItemId1, quantity: 1, price: price1 },
            { menuItemId: menuItemId2, quantity: 1, price: price2 },
          ],
        },
        statusHistory: {
          create: [{ status: "PENDING", changedBy: user.id }],
        },
        payments: {
          create: {
            provider: "MOMO",
            amount: 20.98,
            status: "PENDING",
          },
        },
      },
    });
    console.log(`Created pending order: ${order2.id}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
