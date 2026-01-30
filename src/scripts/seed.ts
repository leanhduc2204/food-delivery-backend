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

  // Create restaurants (no owner in new schema)
  const restaurantsData = [
    { name: "Burger King", description: "Fast Food", latitude: 10.762622, longitude: 106.660172 },
    { name: "Sushi Palace", description: "Japanese", latitude: 10.763622, longitude: 106.661172 },
    { name: "Pasta House", description: "Italian", latitude: 10.764622, longitude: 106.662172 },
    { name: "Taco Fiesta", description: "Mexican", latitude: 10.765622, longitude: 106.663172 },
    { name: "Curry Corner", description: "Indian", latitude: 10.766622, longitude: 106.664172 },
  ];

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
    });
    console.log(`Created restaurant: ${restaurant.name}`);
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
