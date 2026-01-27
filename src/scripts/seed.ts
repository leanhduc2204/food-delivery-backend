import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log("Start seeding ...");

  const restaurants = [
    {
      name: "Burger King",
      cuisine: "Fast Food",
      image:
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&q=80",
    },
    {
      name: "Sushi Palace",
      cuisine: "Japanese",
      image:
        "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    },
    {
      name: "Pasta House",
      cuisine: "Italian",
      image:
        "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80",
    },
    {
      name: "Taco Fiesta",
      cuisine: "Mexican",
      image:
        "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80",
    },
    {
      name: "Curry Corner",
      cuisine: "Indian",
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356f36?w=800&q=80",
    },
  ];

  console.log("Seeding categories...");
  const categoryNames = [
    "Fast Food",
    "Japanese",
    "Italian",
    "Mexican",
    "Indian",
  ];
  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
    console.log(`Created category: ${category.name}`);
  }

  for (let i = 0; i < restaurants.length; i++) {
    const email = `owner${i + 1}@example.com`;
    const password = await bcrypt.hash("password123", SALT_ROUNDS);

    // Create Owner
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password,
        name: `Owner of ${restaurants[i].name}`,
        role: "RESTAURANT_OWNER",
      },
    });

    console.log(`Created user: ${user.email}`);

    // Create Restaurant
    // Check if restaurant exists for this owner
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { ownerId: user.id },
    });

    let restaurant;
    // Find matching category
    const categoryName = restaurants[i].cuisine;
    const category = categories.find((c) => c.name === categoryName);

    if (!existingRestaurant) {
      restaurant = await prisma.restaurant.create({
        data: {
          name: restaurants[i].name,
          // cuisine: restaurants[i].cuisine, // Note: Schema doesn't have cuisine yet, handled loosely
          image: restaurants[i].image,
          ownerId: user.id,
          categories: category
            ? {
                connect: { id: category.id },
              }
            : undefined,
          menu: {
            create: [
              {
                name: `${restaurants[i].name} Special`,
                price: 15.99,
                description: "Chef recommended",
              },
              { name: "Drink", price: 2.99, description: "Soft drink" },
            ],
          },
        },
      });
      console.log(`Created restaurant: ${restaurant.name}`);
    } else {
      console.log(`Updating restaurant image/category for ${user.email}`);
      restaurant = await prisma.restaurant.update({
        where: { id: existingRestaurant.id },
        data: {
          image: restaurants[i].image,
          categories: category
            ? {
                connect: { id: category.id },
              }
            : undefined,
        },
      });
    }
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
