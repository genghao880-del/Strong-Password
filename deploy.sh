#!/bin/bash

# This script automates the entire deployment process for the PassFortress application.
# It installs dependencies, creates and configures the D1 database, and deploys to Cloudflare Pages.
#
# PREREQUISITES:
# 1. Node.js and npm must be installed
# 2. A Cloudflare account
# 3. Permissions to create D1 databases and deploy to Cloudflare Pages
#
# USAGE:
# 1. Make the script executable: chmod +x deploy.sh
# 2. Run the script: ./deploy.sh
#
# WHAT THIS SCRIPT DOES:
# 1. Installs project dependencies with npm
# 2. Logs you into Cloudflare (opens browser for authentication)
# 3. Creates a D1 database named "passfortress-db"
# 4. Automatically updates wrangler.toml with the database ID
# 5. Applies the database schema from schema.sql
# 6. Deploys the application to Cloudflare Pages

# Stop execution if any command fails
set -e

echo "🚀 Starting PassFortress Full Deployment..."
echo "-------------------------------------------"

# 1. Install dependencies
echo "📦 Step 1/6: Installing project dependencies (npm install)..."
npm install
echo "✅ Dependencies installed."
echo ""

# 2. Log in to Cloudflare
echo "👤 Step 2/6: Logging in to Cloudflare..."
echo "Your browser will open for you to log in and authorize Wrangler."
npx wrangler login
echo "✅ Logged in successfully."
echo ""

# 3. Create the D1 database
echo "🗄️ Step 3/6: Creating D1 Database 'passfortress-db'..."
# Create the database and capture the JSON output.
# The `|| true` prevents the script from exiting if the database already exists.
DB_OUTPUT=$(npx wrangler d1 create passfortress-db || true)
echo "$DB_OUTPUT"

# 4. Extract the database ID
echo "🔍 Step 4/6: Extracting Database ID..."
# This robustly finds the line with "uuid", then uses sed to extract the value.
DB_ID=$(echo "$DB_OUTPUT" | grep '"uuid"' | sed 's/.*"uuid": "\(.*\)",/\1/')

if [ -z "$DB_ID" ]; then
    echo "⚠️ Warning: Could not automatically create or find database ID. It might already exist."
    echo "Attempting to find existing database ID..."
    EXISTING_DB_ID=$(npx wrangler d1 info passfortress-db --json | grep '"uuid"' | sed 's/.*"uuid": "\(.*\)",/\1/')
    if [ -z "$EXISTING_DB_ID" ]; then
        echo "❌ FATAL: Could not find Database ID for 'passfortress-db'. Please create it manually in the Cloudflare dashboard and update wrangler.toml."
        exit 1
    fi
    DB_ID=$EXISTING_DB_ID
fi
echo "✅ Database ID found: $DB_ID"
echo ""

# 5. Update wrangler.toml with the database ID
echo "📝 Step 5/6: Updating wrangler.toml configuration file..."
# Use sed to replace the empty database_id field.
# This version is compatible with both macOS and Linux sed.
sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
# Remove the backup file created by sed
rm wrangler.toml.bak
echo "✅ wrangler.toml updated successfully."
echo ""

# 6. Apply the database schema
echo "📋 Step 6/6: Applying database schema..."
npx wrangler d1 execute passfortress-db --file=./schema.sql
echo "✅ Schema applied."
echo ""

# 7. Deploy the application
echo "☁️ Final Step: Deploying to Cloudflare Pages..."
npx wrangler pages deploy .

echo "-------------------------------------------"
echo "🎉 DEPLOYMENT COMPLETE! 🎉"
echo "Your PassFortress application is now live."
echo "-------------------------------------------"