import { Router, IRequest, error, json } from 'itty-router';

// Define the environment interface for type safety
export interface Env {
    DB: any;
}

// Define the structure of a password entry from the DB
interface DbPasswordEntry {
    id: number;
    website: string;
    password: string;
    created_at: string;
}

const router = Router();

// Middleware to add CORS headers to a response
const withCors = (response: Response) => {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    return new Response(response.body, { ...response, headers });
};

// Handle CORS preflight requests
router.options('*', () => new Response(null, {
    status: 204, // No Content
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }
}));

// GET all passwords
router.get('/api/passwords', async (request: IRequest, env: Env) => {
    try {
        const stmt = env.DB.prepare(
            'SELECT * FROM passwords ORDER BY created_at DESC'
        );
        const results = await stmt.all();
        return json(results.results);
    } catch (e: any) {
        return error(500, { message: 'Database query failed', error: e.message });
    }
});

// POST a new password
router.post('/api/passwords', async (request: IRequest, env: Env) => {
    try {
        const { website, password } = await request.json();

        if (!website || !password) {
            return error(400, 'Website and password are required');
        }

        const stmt = env.DB.prepare(
            'INSERT INTO passwords (website, password) VALUES (?, ?) RETURNING *'
        );
        
        const bindStmt = stmt.bind(website, password);
        const results = await bindStmt.all();
        
        if (results.results.length === 0) {
            return error(500, 'Failed to create password entry');
        }

        return json(results.results[0]);
    } catch (e: any) {
        return error(500, { message: 'Failed to create entry', error: e.message });
    }
});

// DELETE a password by ID
router.delete('/api/passwords/:id', async (request: IRequest, env: Env) => {
    const { id } = request.params;
    if (!id) {
        return error(400, 'ID parameter is required');
    }

    try {
        const stmt = env.DB.prepare(
            'DELETE FROM passwords WHERE id = ?'
        );
        
        const result = await stmt.bind(id).run();

        if (!result.success) {
            return error(404, 'Password not found or could not be deleted');
        }

        return json({ success: true, id });
    } catch (e: any) {
        return error(500, { message: 'Failed to delete entry', error: e.message });
    }
});

// Catch-all for 404s
router.all('*', () => error(404, 'Not Found'));

// The main fetch handler for the Worker
export default {
    async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
        return router
            .handle(request, env, ctx)
            .catch(error)
            .then(withCors);
    },
};