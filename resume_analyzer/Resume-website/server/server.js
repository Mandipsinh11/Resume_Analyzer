import "dotenv/config";

import express from "express";
import "./config/google.passport.js";
import "./config/linkedin.passport.js";
import { connectDatabase } from "./config/database.js";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import aiResumeRoutes from "./routes/resumeRoutes.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/],
    credentials: true,
  }),
);
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Session (required for Passport OAuth)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Test route
app.get("/run", (req, res) => res.send("Backend is running ✅"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/ai-resume", aiResumeRoutes);
app.use("/api/payment", paymentRoutes);

const PORT = process.env.PORT || 5001;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`http://localhost:${PORT} 🚀`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
