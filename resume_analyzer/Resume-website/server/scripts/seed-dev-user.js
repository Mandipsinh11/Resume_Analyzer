/**
 * Creates a local dev user if missing.
 * Usage: node scripts/seed-dev-user.js
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database.js";
import User from "../models/User.js";

const email = process.env.DEV_USER_EMAIL || "mandip@gmail.com";
const password = process.env.DEV_USER_PASSWORD || "password123";
const name = process.env.DEV_USER_NAME || "Mandip";

await connectDatabase();

const existing = await User.findOne({ email });
if (existing) {
  console.log(`User already exists: ${email}`);
  process.exit(0);
}

const hashedPassword = await bcrypt.hash(password, 10);
await User.create({ name, email, password: hashedPassword });
console.log(`Created dev user: ${email} / ${password}`);
process.exit(0);
