#!/usr/bin/env bash
set -o errexit  # Exit immediately on error

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

echo "🧱 Building frontend..."
npm install --prefix client
npm run build --prefix client
cd ..

cd server

echo "⚙️ Applying database migrations..."
flask db upgrade || echo "No migrations found or database not configured yet."

echo "🚀 Starting Gunicorn server..."
gunicorn server.app:app --workers=4 --threads=2 --timeout=120
