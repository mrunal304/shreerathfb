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

// Auto-create the admin user on startup so it's always available in MongoDB
// after a fresh `git pull` / restart / deployment, without any manual step.
// Only seeds when the 'users' collection is completely empty — if any user
// already exists, this is a no-op.
async function ensureAdminUser() {
  const existing = await UserModel.findOne({});
  if (existing) return;

  const username = process.env.ADMIN_USERNAME;
  const plainPassword = process.env.ADMIN_PASSWORD;
  if (!username || !plainPassword) {
    console.warn(
      "ADMIN_USERNAME/ADMIN_PASSWORD not set — skipping admin user creation"
    );
    return;
  }

  const password = await bcrypt.hash(plainPassword, 10);
  await UserModel.create({ username, password, role: "admin" });
  console.log(`Created default admin user "${username}" in MongoDB`);
}
