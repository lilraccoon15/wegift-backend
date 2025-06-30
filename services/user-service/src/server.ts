import app from "./app";
import sequelize from "./config/database";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3003;

(async () => {
    try {
        await sequelize.authenticate();
        logger.info("Connexion DB réussie");

        app.listen(PORT, () => {
            logger.info(`Serveur lancé sur http://localhost:${PORT}`);
        });
    } catch (err) {
        logger.error("Impossible de se connecter à la DB :", err);
    }
})();
