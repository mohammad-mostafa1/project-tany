// Signup always creates a customer, so promoting an account to admin happens here.
//
//   node make-admin.js you@example.com            -> make this account an admin
//   node make-admin.js you@example.com customer   -> demote it back to customer
//   node make-admin.js --list                     -> show every account and its role

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const mongoose = require("mongoose");
require("dotenv").config();

const dbConnect = require("./config/db-connect");
const User = require("./models/user-model");

const run = async () => {
  await dbConnect();

  if (mongoose.connection.readyState !== 1) {
    throw new Error("Could not connect to the database");
  }

  const [target, roleArg] = process.argv.slice(2);

  if (!target || target === "--list") {
    const users = await User.find().sort({ createdAt: 1 });

    if (users.length === 0) {
      console.log("No accounts yet — sign up from the website first.");
    } else {
      console.log(`${users.length} account(s):`);
      for (const user of users) {
        console.log(`  ${user.role.padEnd(8)} ${user.email}  (${user.firstName} ${user.lastName})`);
      }
    }

    if (!target) {
      console.log("\nUsage: node make-admin.js <email> [admin|customer]");
    }

    await mongoose.connection.close();
    return;
  }

  const role = roleArg === "customer" ? "customer" : "admin";

  const user = await User.findOneAndUpdate(
    { email: target.toLowerCase().trim() },
    { role },
    { returnDocument: "after" }
  );

  if (!user) {
    console.error(`No account found for "${target}". Sign up on the website first.`);
    await mongoose.connection.close();
    process.exit(1);
  }

  console.log(`${user.firstName} ${user.lastName} (${user.email}) is now ${role}.`);
  console.log("Sign out and sign back in for the new role to take effect.");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
