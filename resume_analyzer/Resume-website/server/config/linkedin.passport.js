import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();
console.log("LINKEDIN_CALLBACK_URL exists:", !!process.env.LINKEDIN_CALLBACK_URL);

passport.use(
    new LinkedInStrategy(
        {
            clientID: process.env.LINKEDIN_CLIENT_ID,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
            callbackURL: process.env.LINKEDIN_CALLBACK_URL,
            scope: ["openid", "profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email =
                    profile.emails?.[0]?.value ||
                    profile._json?.email ||
                    `linkedin_${profile.id}@atsify.app`;
                const name =
                    profile.displayName ||
                    profile._json?.name ||
                    `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
                    "LinkedIn User";
                const avatar =
                    profile.photos?.[0]?.value ||
                    profile._json?.picture ||
                    null;

                console.log(`LinkedIn Auth: Found profile for ${email} (ID: ${profile.id})`);

                let user = await User.findOne({
                    $or: [{ email }, { linkedinId: profile.id }],
                });

                if (!user) {
                    user = await User.create({
                        name,
                        email,
                        linkedinId: profile.id,
                        avatar,
                        password: null,
                    });
                } else {
                    if (!user.linkedinId) {
                        user.linkedinId = profile.id;
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
