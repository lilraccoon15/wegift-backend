import app from "./app";
import sequelize from "./config/database";
import logger from "./utils/logger";

const PORT = Number(process.env.PORT) || 3001;

(async () => {
  try {
    await sequelize.authenticate();
    logger.info("Connexion DB réussie");

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`Serveur lancé sur http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    logger.error("Impossible de se connecter à la DB :", err);
  }
})();
