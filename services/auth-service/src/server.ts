import app from "./app";
import sequelize from "./config/database";
import logger from "./utils/logger";

import fs from "fs";
import path from "path";

const imgPath = path.resolve(__dirname, "../public/img");

fs.readdir(imgPath, (err, files) => {
  if (err) {
    console.error("Erreur lecture img :", err);
  } else {
    console.log("Fichiers dans /public/img :", files);
  }
});

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
