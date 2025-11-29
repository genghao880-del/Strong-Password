
# PassFortress

A secure, full-stack password manager. Generate strong, random passwords and store them safely in your private cloud database on Cloudflare.

## Features

- Generate strong, random passwords
- Store passwords securely in the cloud
- View, copy, and delete stored passwords
- Responsive design that works on all devices
- End-to-end encryption (in production)

## Tech Stack

- Frontend: React + TypeScript + Tailwind CSS
- Backend: Cloudflare Workers + D1 Database
- Deployment: Cloudflare Pages

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Cloudflare account

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd passfortress
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Development

To run the application locally:

```bash
npm run dev
```

This will start a local development server with Wrangler.

## Deployment

### Automated Deployment

Run the deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
1. Install dependencies
2. Log in to Cloudflare
3. Create the D1 database
4. Apply the database schema
5. Deploy to Cloudflare Pages

### Manual Deployment

1. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

2. Create the D1 database:
   ```bash
   npm run db:create
   ```

3. Update the `wrangler.toml` file with your database ID.

4. Apply the database schema:
   ```bash
   npm run db:schema
   ```

5. Deploy to Cloudflare Pages:
   ```bash
   npm run deploy
   ```

## Project Structure

```
.
├── functions/api/[[path]].ts  # API routes
├── App.tsx                    # Main React component
├── index.tsx                  # React entry point
├── index.html                 # HTML template
├── constants.tsx              # SVG icons
├── types.ts                   # TypeScript types
├── schema.sql                 # Database schema
├── wrangler.toml              # Cloudflare configuration
├── package.json               # Project dependencies and scripts
└── deploy.sh                  # Deployment script
```

## Security Considerations

This is a demo application. In a production environment, you should:

1. Implement proper user authentication
2. Encrypt passwords before storing them in the database
3. Add rate limiting to API endpoints
4. Use environment variables for sensitive configuration
5. Implement proper input validation and sanitization

## License

MIT