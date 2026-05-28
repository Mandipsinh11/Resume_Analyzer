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
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

app.use(limiter);
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
