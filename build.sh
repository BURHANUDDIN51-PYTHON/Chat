#!/bin/bash

# Exit on any error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Collect static files (for WhiteNoise)
python manage.py collectstatic --noinput

# Apply database migrations (if using PostgreSQL)
python manage.py migrate