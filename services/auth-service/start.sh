#!/bin/sh

echo "🚀 Lancement des migrations..."
npx sequelize-cli db:migrate --require ts-node/register

echo "✅ Migrations terminées, démarrage du serveur"
node dist/server.js
