#!/bin/sh

echo "🚀 Lancement des migrations Sequelize..."

npx sequelize-cli db:migrate \
  --config dist/sequelize-cli.config.js \
  --migrations-path dist/migrations

echo "✅ Migrations terminées, démarrage du serveur..."
node dist/server.js