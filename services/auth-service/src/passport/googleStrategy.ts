import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import passport from "passport";
import { Request } from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User";
import currentConfig from "../config";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${currentConfig.apiUrls.AUTH_SERVICE}/oauth/google/callback`,
            passReqToCallback: true,
        },
        async (
            req: Request,
            accessToken: string,
            refreshToken: string,
            profile: Profile,
            done
        ) => {
            try {
                const googleId = profile.id;
                const email = profile.emails?.[0].value;

                if (!email) {
                    return done(new Error("L'email Google est requis"));
                }

                // Cas spécial : liaison manuelle depuis compte connecté
                if (req.query.link === "true" && req.user) {
                    const currentUser = req.user as User;
                    currentUser.googleId = googleId;
                    await currentUser.save();
                    return done(null, currentUser);
                }

                // 1. Connexion si déjà lié à Google
                const userByGoogle = await User.findOne({
                    where: { googleId },
                });
                if (userByGoogle) return done(null, userByGoogle);

                // 2. Liaison automatique si email déjà utilisé
                const userByEmail = await User.findOne({ where: { email } });
                if (userByEmail) {
                    userByEmail.googleId = googleId;
                    await userByEmail.save();
                    return done(null, userByEmail);
                }

                // 3. Nouveau compte
                const newUser = await User.create({
                    email,
                    password: uuidv4(), // valeur random, jamais utilisée
                    acceptedTerms: true,
                    newsletter: false,
                    isActive: true,
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                    role: "user",
                    googleId,
                });

                // Créer le profil dans user-service
                await axios.post(
                    `${currentConfig.apiUrls.USER_SERVICE}/api/internal/create-profile`,
                    {
                        userId: newUser.id,
                        pseudo: generatePseudo(profile),
                        birthDate: "2000-01-01",
                        picture: profile.photos?.[0].value || null,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.INTERNAL_API_TOKEN}`,
                        },
                    }
                );

                return done(null, newUser);
            } catch (error) {
                console.error("❌ Erreur dans googleStrategy :", error);
                return done(error);
            }
        }
    )
);

function generatePseudo(profile: Profile): string {
    const base = profile.name?.givenName?.toLowerCase() || "user";
    const random = Math.floor(Math.random() * 10000);
    return `${base}${random}`;
}
