# PassFortress

A secure, full-stack password manager. Generate strong, random passwords and store them safely in your private cloud database on Cloudflare.

![PassFortress Interface](https://placehold.co/600x400?text=PassFortress+Interface)

## Features

- 🔐 Generate strong, random passwords
- ☁️ Store passwords securely in the cloud
- 👁️ View, copy, and delete stored passwords
- 📱 Fully responsive design that works on all devices
- 🚀 Powered by Cloudflare's global network

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, D1 Database (SQLite)
- **Deployment**: Cloudflare Pages
- **Routing**: itty-router

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Cloudflare](https://dash.cloudflare.com/sign-up) account

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd passfortress
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure the Database

Create a D1 database and update the `wrangler.toml` file with your database name and UUID.

### 4. Apply Database Schema

```bash
npx wrangler d1 execute YOUR_DB_NAME --file=./schema.sql
```

### 5. Local Development

```bash
npm run dev
```

Visit `http://localhost:8788` in your browser.

### 6. Deployment

```bash
npm run deploy
```

## Project Structure

```
.
├── functions/
│   └── api/
│       └── [[path]].ts     # API routes
├── public/                 # Static assets
├── src/
│   ├── App.tsx             # Main React component
│   ├── index.tsx           # React entry point
│   ├── constants.tsx       # SVG Icons
│   └── types.ts            # TypeScript types
├── index.html              # HTML template
├── schema.sql              # Database schema
├── wrangler.toml           # Cloudflare configuration
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## Available Scripts

- `npm run dev` - Start local development server
- `npm run deploy` - Deploy to Cloudflare Pages
- `npm run db:create` - Create D1 database
- `npm run db:schema` - Apply database schema

## Security Considerations

⚠️ **Important:** This is a demo application. In a production environment, you should:

1. Implement proper user authentication
2. Encrypt passwords before storing them in the database
3. Add rate limiting to API endpoints
4. Use environment variables for sensitive configuration
5. Implement proper input validation and sanitization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT