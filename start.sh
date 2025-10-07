#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt  # just to be safe if dependencies change
flask db upgrade  # apply migrations automatically
gunicorn server.app:app --workers=2 --threads=2 --timeout=120

