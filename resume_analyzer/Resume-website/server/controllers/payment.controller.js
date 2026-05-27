import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";

const getRazorpayClient = () => {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured in environment");
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

// Plan details (amount in paise - INR)
const PLANS = {
  basic: {
    name: "ATSify Basic",
    amount: 24900, // ₹249/month (~$2.99)
    currency: "INR",
  },
  pro: {
    name: "ATSify Pro",
    amount: 57900, // ₹579/month (~$6.99)
    currency: "INR",
  },
};

const getAuthUserId = (req) => req.user?.id || req.user?._id;

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const { amount, currency, name } = PLANS[plan];

    const options = {
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        plan,
        userId: userId.toString(),
      },
    };

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: name,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      message:
        error.message || "Failed to create payment order",
    });
  }
};

// Verify payment signature & activate plan
export const verifyPayment = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Razorpay key secret is not configured",
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification fields",
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    // Update user's subscription in DB
    const planExpiry = new Date();
    planExpiry.setMonth(planExpiry.getMonth() + 1);

    await User.findByIdAndUpdate(userId, {
      subscription: {
        plan,
        status: "active",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        startDate: new Date(),
        expiryDate: planExpiry,
      },
    });

    res.json({
      success: true,
      message: "Payment verified! Plan activated 🎉",
      plan,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json({ success: false, message: "Payment verification failed" });
  }
};

// Get current subscription status
export const getSubscription = async (req, res) => {
  try {
    const userId = getAuthUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId).select("subscription");
    res.json({ subscription: user?.subscription || null });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
};
