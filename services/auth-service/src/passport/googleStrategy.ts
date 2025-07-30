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

          // Récupérer profil
          let userProfileId: string | null = null;
          try {
            const response = await axios.get(
              `${currentConfig.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${currentUser.id}`,
              {
                headers: {
                  "x-internal-token": process.env.INTERNAL_API_TOKEN,
                },
              }
            );
            userProfileId = response.data?.data?.profile?.id ?? null;
          } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
          }

          return done(null, {
            ...currentUser.toJSON(),
            userId: userProfileId,
          });
        }

        // Connexion si déjà lié à Google
        const userByGoogle = await User.findOne({
          where: { googleId },
        });
        if (userByGoogle) {
          let userProfileId: string | null = null;
          try {
            const response = await axios.get(
              `${currentConfig.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${userByGoogle.id}`,
              {
                headers: {
                  "x-internal-token": process.env.INTERNAL_API_TOKEN,
                },
              }
            );
            userProfileId = response.data?.data?.profile?.id ?? null;
          } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
          }

          return done(null, {
            ...userByGoogle.toJSON(),
            userId: userProfileId,
          });
        }

        // Liaison automatique si email déjà utilisé
        const userByEmail = await User.findOne({ where: { email } });
        if (userByEmail) {
          userByEmail.googleId = googleId;
          await userByEmail.save();

          let userProfileId: string | null = null;
          try {
            const response = await axios.get(
              `${currentConfig.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${userByEmail.id}`,
              {
                headers: {
                  "x-internal-token": process.env.INTERNAL_API_TOKEN,
                },
              }
            );
            userProfileId = response.data?.data?.profile?.id ?? null;
          } catch (error) {
            console.error("Erreur lors de la récupération du profil :", error);
          }

          return done(null, {
            ...userByEmail.toJSON(),
            userId: userProfileId,
          });
        }

        // Nouveau compte
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

        let userProfileId: string | null = null;
        try {
          const response = await axios.get(
            `${currentConfig.apiUrls.USER_SERVICE}/api/internal/find-by-auth/${newUser.id}`,
            {
              headers: {
                "x-internal-token": process.env.INTERNAL_API_TOKEN,
              },
            }
          );
          userProfileId = response.data?.data?.profile?.id ?? null;
        } catch (error) {
          console.error("Erreur lors de la récupération du profil :", error);
        }

        return done(null, {
          ...newUser.toJSON(),
          userId: userProfileId,
        });
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
