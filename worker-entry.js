import { Router } from "itty-router"

const router = Router()

// CORS preflight
router.options("*", () => new Response(null, {
  status: 204,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }
}))

router.get("/api/passwords", async (request, env) => {
  try {
    const stmt = env.DB.prepare("SELECT * FROM passwords ORDER BY created_at DESC")
    const results = await stmt.all()
    return new Response(JSON.stringify(results.results || []), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})

router.post("/api/passwords", async (request, env) => {
  try {
    const body = await request.json()
    const website = body.website
    const password = body.password
    if (!website || !password) {
      return new Response(JSON.stringify({ error: "website and password required" }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    const stmt = env.DB.prepare("INSERT INTO passwords (website, password) VALUES (?, ?) RETURNING *")
    const res = await stmt.bind(website, password).all()
    const created = (res.results && res.results[0]) || null
    return new Response(JSON.stringify(created), { status: 201, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})

router.delete("/api/passwords/:id", async (request, env) => {
  try {
    const id = request.params.id
    if (!id) return new Response(JSON.stringify({ error: "id required" }), { status: 400, headers: { "Content-Type": "application/json" } })
    const stmt = env.DB.prepare("DELETE FROM passwords WHERE id = ?")
    const result = await stmt.bind(id).run()
    return new Response(JSON.stringify({ success: true, id }), { headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } })
  }
})

router.all("*", () => new Response("Not Found", { status: 404 }))

export default {
  async fetch(request, env, ctx) {
    return router.handle(request, env, ctx)
  }
}
