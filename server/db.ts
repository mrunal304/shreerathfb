import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "./storage";

export async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not found, skipping database connection");
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
    await ensureAdminUser();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Make sure an admin account always exists in MongoDB so login works the
// same way in every environment (dev and any deployment), instead of relying
// on hardcoded/in-memory credentials that don't persist to the real database.
async function ensureAdminUser() {
  const username = process.env.ADMIN_USERNAME || "admin";
  const existing = await UserModel.findOne({ username });
  if (existing) return;

  const plainPassword = process.env.ADMIN_PASSWORD || "shreerath_admin_2026";
  const password = await bcrypt.hash(plainPassword, 10);
  await UserModel.create({ username, password, role: "admin" });
  console.log(`Created default admin user "${username}" in MongoDB`);
}
