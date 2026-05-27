import express from "express";
import User from "../models/User.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  protect,
  signUpValidation,
  loginValidation,
} from "../middleware/auth.middleware.js";
import { signup, login } from "../controllers/auth.controller.js";

const router = express.Router();
const DEFAULT_CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const isSafeClientUrl = (value) => {
  try {
    const url = new URL(value);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return isHttp && isLocalhost;
  } catch {
    return false;
  }
};

const resolveClientUrl = (req) => {
  const sessionUrl = req.session?.oauthClientUrl;
  const queryUrl = req.query?.clientUrl;
  const originUrl = req.get("origin");
  const candidate = sessionUrl || queryUrl || originUrl || DEFAULT_CLIENT_URL;

  // If candidate is missing or looks like the broken string, fallback
  if (!candidate || candidate.includes(",")) return DEFAULT_CLIENT_URL;

  return isSafeClientUrl(candidate) ? candidate : DEFAULT_CLIENT_URL;
};

const captureClientUrl = (req, _res, next) => {
  if (req.session) {
    req.session.oauthClientUrl = resolveClientUrl(req);
  }
  next();
};

// ─── Email / Password ──────────────────────────────────────────────────────
router.post("/signup", signUpValidation, signup);
// router.post("/login", loginValidation, login);
router.post("/login", login);

// ─── Helper: generate JWT & redirect to frontend ──────────────────────────
const oauthSuccess = (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const userResponse = user.toObject ? user.toObject() : { ...user };
    delete userResponse.password;
    delete userResponse.resumeParsed;

    const clientUrl = resolveClientUrl(req);
    const encoded = encodeURIComponent(JSON.stringify(userResponse));
    if (req.session) {
      delete req.session.oauthClientUrl;
    }
    // Redirect frontend with token + user in query params
    res.redirect(`${clientUrl}/oauth-callback?token=${token}&user=${encoded}`);
  } catch (err) {
    const clientUrl = resolveClientUrl(req);
    if (req.session) {
      delete req.session.oauthClientUrl;
    }
    res.redirect(`${clientUrl}/login?error=oauth_failed`);
    console.error("OAuth Success processing error:", err);
  }
};

// ─── Google OAuth ──────────────────────────────────────────────────────────
router.get(
  "/google",
  captureClientUrl,
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err || !user) {
        const clientUrl = resolveClientUrl(req);
        if (req.session) {
          delete req.session.oauthClientUrl;
        }
        return res.redirect(`${clientUrl}/login?error=oauth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  oauthSuccess,
);

// ─── LinkedIn OAuth ────────────────────────────────────────────────────────
router.get("/linkedin", captureClientUrl, passport.authenticate("linkedin"));
router.get(
  "/linkedin/callback",
  (req, res, next) => {
    passport.authenticate("linkedin", { session: false }, (err, user, info) => {
      if (err || !user) {
        const clientUrl = resolveClientUrl(req);
        if (req.session) {
          delete req.session.oauthClientUrl;
        }
        return res.redirect(`${clientUrl}/login?error=oauth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  oauthSuccess,
);

// ─── Protected profile route ───────────────────────────────────────────────
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

export default router;
