// backend/src/services/createadmin.js
const bcrypt = require("bcryptjs");
const User = require("../models/user");

module.exports = async function seedSuperAdmin() {
  try {
    const exists = await User.findOne({ role: "SUPER_ADMIN" });
    if (exists) {
      console.log("Super Admin already exists");
      return;
    }

    const passwordHash = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD,
      10
    );

    await User.create({
      name: "System Owner",
      email: process.env.SUPER_ADMIN_EMAIL,
      password: passwordHash,
      role: "SUPER_ADMIN"
    });

    console.log("Super Admin Created Successfully");
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  }
};