import { Router } from 'itty-router'

const router = Router()

// ============ Helper Functions ============

// Base64 helpers
function base64ToBytes(str) {
  return Uint8Array.from(atob(str), c => c.charCodeAt(0))
}
function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

// Legacy hash (backwards compatibility for existing accounts)
async function legacyHashPassword(password) {
  const enc = new TextEncoder()
  const data = enc.encode(password + 'salt_demo')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bytesToBase64(new Uint8Array(hashBuffer))
}

// Create PBKDF2 hash with random salt: returns "salt:hash" (both base64)
async function createPasswordHash(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
  const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, passKey, 256)
  const derived = new Uint8Array(derivedBits)
  const saltB64 = bytesToBase64(salt)
  const hashB64 = bytesToBase64(derived)
  return `${saltB64}:${hashB64}`
}

// Verify hash supporting both new format (salt:hash) and legacy
async function verifyPassword(password, stored) {
  if (!stored.includes(':')) {
    // Legacy path
    const legacy = await legacyHashPassword(password)
    return legacy === stored
  }
  const [saltB64, hashB64] = stored.split(':')
  const salt = base64ToBytes(saltB64)
  const enc = new TextEncoder()
  const passKey = await crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits'])
  const derivedBits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, passKey, 256)
  const derived = bytesToBase64(new Uint8Array(derivedBits))
  // Constant time compare
  if (derived.length !== hashB64.length) return false
  let diff = 0
  for (let i = 0; i < derived.length; i++) diff |= derived.charCodeAt(i) ^ hashB64.charCodeAt(i)
  return diff === 0
}

// Generate JWT token
async function generateToken(userId) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + 86400 * 7 // 7 days
  }))
  const signature = btoa('demo-secret-key') // In production, use proper HMAC
  return `${header}.${payload}.${signature}`
}

// Verify JWT token
function verifyToken(token) {
  try {
    const [header, payload, signature] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return decoded.userId
  } catch {
    return null
  }
}

// Extract user from request
function getUserFromRequest(request) {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  return verifyToken(token)
}

// Encryption (simple XOR for demo - use AES in production)
function encryptPassword(password, key) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const keyData = encoder.encode(key.slice(0, 32))
  const encrypted = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ keyData[i % keyData.length]
  }
  return bytesToBase64(encrypted)
}

function decryptPassword(encrypted, key) {
  const encrypted_bytes = base64ToBytes(encrypted)
  const keyData = new TextEncoder().encode(key.slice(0, 32))
  const decrypted = new Uint8Array(encrypted_bytes.length)
  for (let i = 0; i < encrypted_bytes.length; i++) {
    decrypted[i] = encrypted_bytes[i] ^ keyData[i % keyData.length]
  }
  return new TextDecoder().decode(decrypted)
}

// ============ CORS Middleware ============
router.options('*', () => new Response(null, {
  status: 204,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}))

// Add CORS headers to all responses
const addCors = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*')
  return response
}

// ============ Auth Routes ============

// Register
router.post('/api/auth/register', async (request, env) => {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return addCors(new Response(JSON.stringify({ error: 'email and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Basic server-side validation (avoid user enumeration / weak password acceptance)
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(email)) {
      return addCors(new Response(JSON.stringify({ error: 'Invalid registration data' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }
    // Password policy: >=8 chars, include 3 of (lower, upper, number, symbol)
    const categories = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].reduce((acc, r) => acc + (r.test(password) ? 1 : 0), 0)
    if (password.length < 8 || categories < 3) {
      return addCors(new Response(JSON.stringify({ error: 'Invalid registration data' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Check if user exists
    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      // Generic message to avoid enumeration
      return addCors(new Response(JSON.stringify({ error: 'Registration failed' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Hash password (PBKDF2)
    const passwordHash = await createPasswordHash(password)

    // Create user
    const stmt = env.DB.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id, email')
    const result = await stmt.bind(email, passwordHash).first()

    const token = await generateToken(result.id)

    return addCors(new Response(JSON.stringify({ user: result, token }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// Login
router.post('/api/auth/login', async (request, env) => {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return addCors(new Response(JSON.stringify({ error: 'email and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Normalize email (defensive)
    const normalizedEmail = email.trim().toLowerCase()
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return addCors(new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }
    const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE email = ?').bind(normalizedEmail).first()
    if (!user) {
      return addCors(new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return addCors(new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const token = await generateToken(user.id)

    return addCors(new Response(JSON.stringify({ user: { id: user.id, email: normalizedEmail }, token }), { status: 200, headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// ============ Password Routes (Protected) ============

// Get all passwords for user
router.get('/api/passwords', async (request, env) => {
  try {
    const userId = getUserFromRequest(request)
    if (!userId) {
      return addCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const stmt = env.DB.prepare('SELECT id, website, password, created_at FROM passwords WHERE user_id = ? ORDER BY created_at DESC')
    const results = await stmt.bind(userId).all()

    // Decrypt passwords (in frontend)
    const decrypted = results.results.map(p => ({
      ...p,
      password: decryptPassword(p.password, `user_${userId}`)
    }))

    return addCors(new Response(JSON.stringify(decrypted), { headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// Create password
router.post('/api/passwords', async (request, env) => {
  try {
    const userId = getUserFromRequest(request)
    if (!userId) {
      return addCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const { website, password } = await request.json()
    if (!website || !password) {
      return addCors(new Response(JSON.stringify({ error: 'website and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(password, `user_${userId}`)

    const stmt = env.DB.prepare('INSERT INTO passwords (user_id, website, password) VALUES (?, ?, ?) RETURNING id, website, created_at')
    const result = await stmt.bind(userId, website, encryptedPassword).first()

    return addCors(new Response(JSON.stringify({ ...result, password }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// Delete password
router.delete('/api/passwords/:id', async (request, env) => {
  try {
    const userId = getUserFromRequest(request)
    if (!userId) {
      return addCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const { id } = request.params
    if (!id) {
      return addCors(new Response(JSON.stringify({ error: 'id required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Verify ownership
    const exists = await env.DB.prepare('SELECT id FROM passwords WHERE id = ? AND user_id = ?').bind(id, userId).first()
    if (!exists) {
      return addCors(new Response(JSON.stringify({ error: 'Password not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }))
    }

    const stmt = env.DB.prepare('DELETE FROM passwords WHERE id = ? AND user_id = ?')
    await stmt.bind(id, userId).run()

    return addCors(new Response(JSON.stringify({ success: true, id }), { headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// Update password
router.put('/api/passwords/:id', async (request, env) => {
  try {
    const userId = getUserFromRequest(request)
    if (!userId) {
      return addCors(new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } }))
    }

    const { id } = request.params
    const { website, password } = await request.json()
    
    if (!id || !website || !password) {
      return addCors(new Response(JSON.stringify({ error: 'id, website and password required' }), { status: 400, headers: { 'Content-Type': 'application/json' } }))
    }

    // Verify ownership
    const exists = await env.DB.prepare('SELECT id FROM passwords WHERE id = ? AND user_id = ?').bind(id, userId).first()
    if (!exists) {
      return addCors(new Response(JSON.stringify({ error: 'Password not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } }))
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(password, `user_${userId}`)

    const stmt = env.DB.prepare('UPDATE passwords SET website = ?, password = ? WHERE id = ? AND user_id = ?')
    await stmt.bind(website, encryptedPassword, id, userId).run()

    return addCors(new Response(JSON.stringify({ success: true, id, website }), { headers: { 'Content-Type': 'application/json' } }))
  } catch (e) {
    return addCors(new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } }))
  }
})

// Fallback
router.all('*', () => addCors(new Response('Not Found', { status: 404 })))

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes first
    if (url.pathname.startsWith('/api/')) {
      return router.handle(request, env, ctx);
    }
    
    // Try to serve static assets
    if (env.ASSETS) {
      try {
        const assetResponse = await env.ASSETS.fetch(request);
        if (assetResponse.status !== 404) {
          // Add cache control headers to prevent caching
          const headers = new Headers(assetResponse.headers);
          headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          headers.set('Pragma', 'no-cache');
          headers.set('Expires', '0');
          return new Response(assetResponse.body, {
            status: assetResponse.status,
            statusText: assetResponse.statusText,
            headers: headers
          });
        }
      } catch (e) {
        // Asset not found, continue
      }
    }
    
    // Fallback to router for other requests
    return router.handle(request, env, ctx);
  }
}
