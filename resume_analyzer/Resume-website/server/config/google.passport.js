import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

console.log("Initializing Passport with Google Strategy...");
console.log("GOOGLE_CLIENT_ID exists:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET exists:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5001/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const name =
                    profile.displayName || profile.name?.givenName || "Google User";
                const avatar = profile.photos?.[0]?.value || null;

                if (!email) return done(new Error("No email from Google profile"));

                console.log(`Google Auth: Found profile for ${email} (ID: ${profile.id})`);

                let user = await User.findOne({ $or: [{ email }, { googleId: profile.id }] });
                if (!user) {
                    user = await User.create({
                        name,
                        email,
                        googleId: profile.id,
                        avatar,
                        password: null,
                    });
                } else {
                    // Link Google ID if signing in via email that already exists
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        if (!user.avatar && avatar) user.avatar = avatar;
                        await user.save();
                    }
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);
