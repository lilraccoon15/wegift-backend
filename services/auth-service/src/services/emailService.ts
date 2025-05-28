import nodemailer from "nodemailer";
import logger from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendActivationEmail = async (email: string, token: string) => {
  const activationLink = `http://localhost:5173/activate?token=${token}`;

  try {
    await transporter.sendMail({
      from: '"WeGift" <no-reply@wegift.com>',
      to: email,
      subject: "Activation de votre compte WeGift",
      html: `<p>Bonjour,</p>
            <p>Merci de vous être inscrit. Cliquez sur le lien suivant pour activer votre compte :</p>
            <a href="${activationLink}">${activationLink}</a>`,
    });
  } catch (error) {
    logger.error("Erreur envoi mail d'activation de compte :", error);
    throw new Error("Impossible d'envoyer le mail d'activation.");
  }
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: '"WeGift" <no-reply@wegift.com>',
      to: email,
      subject: "Réinitialisation de votre mot de passe WeGift",
      html: `<p>Bonjour,</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour en choisir un nouveau :</p>
            <a href="${resetLink}">${resetLink}</a>`,
    });
  } catch (error) {
    logger.error("Erreur envoi mail réinitialisation mdp :", error);
    throw new Error("Impossible d'envoyer le mail de réinitialisation.");
  }
};
