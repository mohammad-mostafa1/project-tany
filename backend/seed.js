const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = require("./config/db-connect");
const Product = require("./models/product-model");
const User = require("./models/user-model");
const Order = require("./models/order-model");

const products = require("./data/products-seed.json");

const seed = async () => {
  await dbConnect();

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Could not connect to the database");
  }

  const wipeAccounts = process.argv.includes("--with-users");

  await Promise.all([
    Product.deleteMany({}),
    Order.deleteMany({}),
    wipeAccounts ? User.deleteMany({}) : Promise.resolve(),
  ]);

  const created = await Product.insertMany(products);
  console.log(`Inserted ${created.length} products`);

  if (wipeAccounts) console.log("Deleted all user accounts");
  else console.log(`Kept ${await User.countDocuments()} existing account(s)`);

  await mongoose.connection.close();
  console.log("Seeding complete — sign up from the website to create your account.");
};

seed().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
