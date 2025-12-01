# Changelog

All notable changes to this project will be documented here.

## 2025-12-01
- **Admin功能新增**:
  - 数据库架构更新：`users` 表添加 `is_admin` 和 `created_at` 字段
  - 新增管理员 API 端点：
    - `GET /api/admin/stats` - 系统统计信息
    - `GET /api/admin/users` - 获取所有用户列表
    - `GET /api/admin/users/:id` - 获取用户详情和密码列表
    - `DELETE /api/admin/users/:id` - 删除用户及其所有数据
    - `PATCH /api/admin/users/:id/admin` - 设置/撤销管理员权限
    - `GET /api/admin/passwords` - 查看所有用户的密码信息
  - 前端管理员面板：
    - 仪表板：显示用户数、管理员数、密码总数、2FA启用率等统计
    - 用户管理：查看、删除用户，设置管理员权限
    - 密码总览：查看所有密码的元数据（不含明文）
  - 安全特性：
    - JWT 验证中间件，确保只有管理员可访问
    - 管理员无法删除自己或撤销自己的权限
    - 删除用户会级联删除其密码和恢复码
- 数据库迁移脚本 `migration-add-admin.sql`
- 管理员功能部署指南 `docs/ADMIN_GUIDE.md`

## 2025-11-30
- Security hardening across backend:
  - Enforced Cloudflare Turnstile on register/login, added `/api/config` for public runtime config.
  - Tightened CORS and CSP; rate limiting and brute-force lockouts.
  - Switched JWT to HMAC-SHA256 with `JWT_SECRET` from environment; added verify helpers.
  - Added prepared statements and table checks to mitigate SQL injection.
- Database schema alignment:
  - Updated `schema.sql` with `users`, `passwords`, `recovery_codes` tables and indexes.
  - Lazy migration for 2FA columns and `passwords.username/tags`.
- Frontend integration:
  - Invisible Turnstile widget; dynamic sitekey via `/api/config`.
  - Sends `X-CF-Turnstile` header for auth flows.
- Deployment & config:
  - Added `[vars]` in `wrangler.toml`: `CUSTOM_DOMAIN=661985.xyz`, `TURNSTILE_SITE_KEY`.
  - Set secrets via wrangler: `TURNSTILE_SECRET`, generated `JWT_SECRET`.
  - Added `routes` to bind `661985.xyz` (requires CF zone routing).
- Bug fixes:
  - Moved `/api/config` route to top-level; fixed `generateToken` call with `env`.
  - Corrected `router.all` signature.

## 2025-11-29
- Initial worker setup and basic password routes.
- Added static asset serving via `[assets]`.
