#!/usr/bin/env bash
set -o errexit  # Exit immediately on error

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

echo "🧱 Building frontend..."
npm install --prefix client
npm run build --prefix client

# Navigate to server directory
if [ -d "server" ]; then
  cd server
elif [ -d "./src/server" ]; then
  cd ./src/server
else
  echo "❌ Could not find server directory!"
  ls -la
  exit 1
fi

echo "⚙️ Applying database migrations..."
export FLASK_APP=app.py
flask db upgrade || echo "No migrations found or database not configured yet."

echo "🚀 Starting Gunicorn server..."
exec gunicorn app:app
