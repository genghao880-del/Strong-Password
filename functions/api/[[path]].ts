import { Router, IRequest, error, json } from 'itty-router';

// Define the environment interface for type safety
export interface Env {
    DB: any;
    JWT_SECRET?: string;
}

// Define the structure of a password entry from the DB
interface DbPasswordEntry {
    id: number;
    website: string;
    password: string;
    created_at: string;
}

interface User {
    id: number;
    email: string;
    is_admin: number;
    created_at: string;
}

// Extend IRequest to include user property
interface AdminRequest extends IRequest {
    user?: User;
}

const router = Router();

// Middleware to verify JWT token and extract user info
async function verifyToken(request: IRequest, env: Env): Promise<User | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.substring(7);
    try {
        // Simple JWT verification (in production, use proper JWT library)
        const [headerB64, payloadB64, signature] = token.split('.');
        if (!headerB64 || !payloadB64 || !signature) {
            return null;
        }
        
        const payload = JSON.parse(atob(payloadB64));
        
        // Verify user exists and get admin status
        const stmt = env.DB.prepare('SELECT id, email, is_admin, created_at FROM users WHERE id = ?');
        const result = await stmt.bind(payload.userId).first();
        
        if (!result) {
            return null;
        }
        
        return result as User;
    } catch (e) {
        return null;
    }
}

// Middleware to check if user is admin
async function requireAdmin(request: AdminRequest, env: Env): Promise<Response | null> {
    const user = await verifyToken(request, env);
    if (!user) {
        return error(401, { message: 'Unauthorized' });
    }
    if (user.is_admin !== 1) {
        return error(403, { message: 'Admin access required' });
    }
    request.user = user;
    return null;
}

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

// ==================== Admin Routes ====================

// GET all users (admin only)
router.get('/api/admin/users', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const stmt = env.DB.prepare(`
            SELECT 
                u.id, 
                u.email, 
                u.is_admin, 
                u.two_factor_enabled,
                u.created_at,
                COUNT(DISTINCT p.id) as password_count
            FROM users u
            LEFT JOIN passwords p ON u.id = p.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        const results = await stmt.all();
        return json(results.results);
    } catch (e: any) {
        return error(500, { message: 'Failed to fetch users', error: e.message });
    }
});

// GET user details (admin only)
router.get('/api/admin/users/:id', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const { id } = request.params;
    try {
        const userStmt = env.DB.prepare(`
            SELECT id, email, is_admin, two_factor_enabled, created_at 
            FROM users WHERE id = ?
        `);
        const user = await userStmt.bind(id).first();
        
        if (!user) {
            return error(404, { message: 'User not found' });
        }

        const passwordsStmt = env.DB.prepare(`
            SELECT id, website, username, created_at, tags
            FROM passwords WHERE user_id = ?
            ORDER BY created_at DESC
        `);
        const passwords = await passwordsStmt.bind(id).all();

        return json({
            user,
            passwords: passwords.results
        });
    } catch (e: any) {
        return error(500, { message: 'Failed to fetch user details', error: e.message });
    }
});

// DELETE user (admin only)
router.delete('/api/admin/users/:id', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const { id } = request.params;
    
    // Prevent admin from deleting themselves
    if (request.user && request.user.id === parseInt(id)) {
        return error(400, { message: 'Cannot delete your own account' });
    }

    try {
        // Delete user's passwords first
        await env.DB.prepare('DELETE FROM passwords WHERE user_id = ?').bind(id).run();
        
        // Delete user's recovery codes
        await env.DB.prepare('DELETE FROM recovery_codes WHERE user_id = ?').bind(id).run();
        
        // Delete user
        const result = await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

        if (!result.success) {
            return error(404, { message: 'User not found' });
        }

        return json({ success: true, message: 'User deleted successfully' });
    } catch (e: any) {
        return error(500, { message: 'Failed to delete user', error: e.message });
    }
});

// UPDATE user admin status (admin only)
router.patch('/api/admin/users/:id/admin', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const { id } = request.params;
    const { is_admin } = await request.json();

    // Prevent admin from removing their own admin status
    if (request.user && request.user.id === parseInt(id) && is_admin === 0) {
        return error(400, { message: 'Cannot remove your own admin privileges' });
    }

    try {
        const stmt = env.DB.prepare('UPDATE users SET is_admin = ? WHERE id = ?');
        const result = await stmt.bind(is_admin ? 1 : 0, id).run();

        if (!result.success) {
            return error(404, { message: 'User not found' });
        }

        return json({ success: true, message: 'User admin status updated' });
    } catch (e: any) {
        return error(500, { message: 'Failed to update user', error: e.message });
    }
});

// GET system statistics (admin only)
router.get('/api/admin/stats', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        const adminCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 1').first();
        const passwordCount = await env.DB.prepare('SELECT COUNT(*) as count FROM passwords').first();
        const twoFAEnabled = await env.DB.prepare('SELECT COUNT(*) as count FROM users WHERE two_factor_enabled = 1').first();

        return json({
            total_users: userCount.count,
            total_admins: adminCount.count,
            total_passwords: passwordCount.count,
            users_with_2fa: twoFAEnabled.count
        });
    } catch (e: any) {
        return error(500, { message: 'Failed to fetch statistics', error: e.message });
    }
});

// GET all passwords from all users (admin only)
router.get('/api/admin/passwords', async (request: AdminRequest, env: Env) => {
    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const stmt = env.DB.prepare(`
            SELECT 
                p.id,
                p.website,
                p.username,
                p.created_at,
                p.tags,
                u.email as user_email,
                u.id as user_id
            FROM passwords p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        const results = await stmt.all();
        return json(results.results);
    } catch (e: any) {
        return error(500, { message: 'Failed to fetch passwords', error: e.message });
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