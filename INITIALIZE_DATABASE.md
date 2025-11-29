# Database Initialization for PassFortress

Since you've already created a D1 database named "password" with UUID "523df01e-9a94-4972-bea8-7b12968f5395", you need to apply the schema to this database.

## Steps to Initialize Your Database

### 1. Apply the Schema

Run the following command to apply the schema to your existing database:

```bash
npx wrangler d1 execute password --file=./schema.sql
```

This will create the `passwords` table in your database with the following structure:

```sql
CREATE TABLE passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  website TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Verify the Schema

After applying the schema, you can verify that the table was created correctly:

```bash
npx wrangler d1 execute password --command="PRAGMA table_info(passwords);"
```

### 3. Test Database Access

You can test inserting a record:

```bash
npx wrangler d1 execute password --command="INSERT INTO passwords (website, password) VALUES ('test.com', 'testpassword');"
```

And then query it:

```bash
npx wrangler d1 execute password --command="SELECT * FROM passwords;"
```

### 4. Deploy the Application

Once the database is initialized, you can deploy the application:

```bash
npm run deploy
```

Or use the deployment scripts:
- On macOS/Linux: `./deploy.sh`
- On Windows: `deploy.bat`

## Troubleshooting

If you encounter any issues:

1. Make sure the database name in [wrangler.toml](file://d:\谷歌下载\code\wrangler.toml) matches your actual database name ("password")
2. Verify that the database UUID is correctly set in [wrangler.toml](file://d:\谷歌下载\code\wrangler.toml)
3. Ensure you're logged into the correct Cloudflare account
4. Check that you have the necessary permissions to access the database