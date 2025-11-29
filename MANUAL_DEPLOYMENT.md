# Manual Deployment Guide for PassFortress

This guide explains how to manually deploy the PassFortress application to Cloudflare without using the automated script.

## Prerequisites

1. A Cloudflare account
2. Wrangler CLI installed (`npm install -g wrangler`)
3. Node.js and npm installed

## Steps

### 1. Install Dependencies

First, install the project dependencies:

```bash
npm install
```

### 2. Login to Cloudflare

Authenticate with your Cloudflare account:

```bash
wrangler login
```

### 3. Create the D1 Database

Create the database using the predefined name:

```bash
npm run db:create
```

Or alternatively:

```bash
wrangler d1 create passfortress-db
```

### 4. Get Your Database ID

After creating the database, you'll receive a JSON response with your database details. Look for the `uuid` field - this is your database ID.

Alternatively, you can list your databases:

```bash
wrangler d1 list
```

### 5. Update wrangler.toml

Open the [wrangler.toml](file://d:\谷歌下载\code\wrangler.toml) file and replace the empty `database_id` value with your actual database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "passfortress-db"
database_id = "your-actual-database-id-here"
```

### 6. Apply the Database Schema

Apply the database schema to create the necessary tables:

```bash
npm run db:schema
```

Or alternatively:

```bash
wrangler d1 execute passfortress-db --file=./schema.sql
```

### 7. Deploy to Cloudflare Pages

Finally, deploy your application:

```bash
npm run deploy
```

Or alternatively:

```bash
wrangler pages deploy .
```

## Troubleshooting

1. If you get permission errors, make sure you're logged into the correct Cloudflare account
2. If the database already exists, the create command will fail. You can skip to step 4 to get the existing database ID
3. Make sure all environment variables and bindings are correctly configured in the Cloudflare dashboard