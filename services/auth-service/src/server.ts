import app from './app';
import sequelize from './config/database';

const PORT = process.env.PORT || 3001;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB réussie !');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Impossible de se connecter à la DB :', err);
  }
})();
