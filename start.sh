#!/usr/bin/env bash
set -o errexit  # Exit immediately on error

echo "📦 Installing backend dependencies..."
pip install -r requirements.txt

echo "🧱 Building frontend..."
npm install --prefix client
npm run build --prefix client

echo "📂 Moving build to backend..."
mkdir -p server/static
cp -r client/build/* server/static/

cd server

echo "⚙️ Applying database migrations..."
export FLASK_APP=app.py
flask db upgrade || echo "No migrations found or database not configured yet."

echo "🚀 Starting Gunicorn server..."
exec gunicorn app:app --bind 0.0.0.0:$PORT
