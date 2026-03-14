#!/bin/sh
set -e

echo "▶ Inicializando banco de dados..."
node src/config/init-db.js

echo "▶ Iniciando servidor..."
exec node server.js
