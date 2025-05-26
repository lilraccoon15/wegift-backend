import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  }
});

export const sendActivationEmail = async (email: string, token: string) => {
  const activationLink = `http://localhost:5173/activate?token=${token}`;

  await transporter.sendMail({
    from: '"WeGift" <no-reply@wegift.com>',
    to: email,
    subject: "Activation de votre compte WeGift",
    html: `<p>Bonjour,</p>
           <p>Merci de vous être inscrit. Cliquez sur le lien suivant pour activer votre compte :</p>
           <a href="${activationLink}">${activationLink}</a>`,
  });
};
