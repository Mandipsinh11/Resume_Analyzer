import express from "express";
import { createOrder, verifyPayment, getSubscription } from "../controllers/payment.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All payment routes require authentication
router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.get("/subscription", protect, getSubscription);

export default router;
