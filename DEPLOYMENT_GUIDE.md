# PassFortress - 安全密码管理器

## 📱 应用概述

PassFortress 是一个全栈安全密码管理应用，基于：
- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Cloudflare Workers/Pages Functions
- **数据库**: Cloudflare D1 (SQLite)
- **部署**: Cloudflare Pages

## 🚀 快速开始 - Cloudflare Pages 部署

### 步骤 1: 在 Cloudflare Dashboard 中连接 GitHub

1. **登录 Cloudflare**: https://dash.cloudflare.com
2. **创建新 Pages 项目**:
   - 左侧菜单 → `Workers & Pages` → `Pages`
   - 点击 `Create application` → `Connect to Git`
   
3. **授权 GitHub**:
   - 选择你的 GitHub 账户 `genghao880-del`
   - 授权 Cloudflare 访问你的仓库
   
4. **选择仓库**:
   - 仓库: `Strong-Password`
   - 分支: `main`
   - 点击 `Begin setup`

5. **配置构建设置**:
   - **项目名称**: `password` (或自定义)
   - **生产分支**: `main`
   - **框架预设**: `None` (留空 - 我们使用 Pages Functions)
   - **构建命令**: `npm install --omit=dev`
   - **构建输出目录**: `public`
   - **环境变量**: 暂时不需要

6. **添加环境绑定**:
   - 展开 `Environment variables`，然后转到最后一步前点击 `Save and Deploy`
   - 部署后，进入 **Settings** → **Functions** → **D1 Database Bindings**
   - 添加绑定:
     - **变量名**: `DB`
     - **数据库**: `password` (选择你创建的 D1 数据库)

### 步骤 2: 在 Cloudflare D1 中初始化数据库

1. **进入 D1**: https://dash.cloudflare.com → `Workers & Pages` → `D1`
2. **选择数据库**: `password`
3. **打开 SQL 编辑器**
4. **执行以下 SQL** (创建用户和密码表):

```sql
-- Drop existing tables if they exist
DROP TABLE IF EXISTS passwords;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create passwords table with user_id foreign key
CREATE TABLE passwords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  website TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster user lookups
CREATE INDEX idx_passwords_user_id ON passwords(user_id);
```

5. 点击 **Execute** 等待完成

### 步骤 3: 在 Pages 中配置 D1 绑定

1. **进入 Pages 项目**: `Workers & Pages` → `Pages` → `password`
2. **Settings** → **Functions** → **D1 Database Bindings**
3. **Add binding**:
   - 变量名: `DB`
   - D1 数据库: `password`
4. **Save** 并等待自动重新部署

### 步骤 4: 访问应用

应用将部署到: `https://password.<your-account>.pages.dev`

或查看 Pages 项目设置中的完整 URL。

## ✨ 功能特性

### 用户认证
- ✅ 邮箱注册 / 登录
- ✅ JWT token 认证
- ✅ 用户数据完全隔离

### 密码管理
- ✅ 加密存储密码（XOR 用户密钥）
- ✅ 自动密码生成器（16 字符，包含特殊符号）
- ✅ 一键复制到剪贴板
- ✅ 删除密码

### 搜索 & 分类
- ✅ 实时搜索网站名称
- ✅ 自动分类 (Email / Finance / Coding / Social / Other)
- ✅ 按分类过滤

### 安全特性
- ✅ CSP 安全头（防止 XSS）
- ✅ 速率限制 (30 请求/分钟)
- ✅ 输入验证 (Email 格式、密码长度)
- ✅ CORS 保护

### 性能优化
- ✅ 5 分钟响应缓存
- ✅ 自动缓存失效
- ✅ Gzip 压缩支持

### 高级功能
- ✅ 密码强度指示器（弱/中/强）
- ✅ CSV 导出（所有密码）
- ✅ 深色主题（默认）

## 🔧 本地开发

### 前置要求
- Node.js 18+
- npm 或 yarn
- Wrangler CLI: `npm install -g @cloudflare/wrangler`

### 安装依赖
```bash
npm install
```

### 本地开发服务器
```bash
wrangler pages dev
```

访问: http://localhost:8787

### 部署更新
```bash
git add .
git commit -m "your message"
git push origin main
```

Pages 会自动检测到 push，重新构建并部署。

## 📊 API 端点

所有 API 端点都在 `/api` 路径下：

### 认证
- `POST /api/auth/register` - 注册新用户
- `POST /api/auth/login` - 用户登录

### 密码管理（需要 Authorization header）
- `GET /api/passwords` - 获取用户的所有密码
- `POST /api/passwords` - 创建新密码
- `DELETE /api/passwords/:id` - 删除密码

### 请求示例

**注册**:
```bash
curl -X POST https://password.genghao880.workers.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**登录**:
```bash
curl -X POST https://password.genghao880.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**获取密码**:
```bash
curl -X GET https://password.genghao880.workers.dev/api/passwords \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🌍 自定义域名 (可选)

如果你有自己的域名,可以在 Cloudflare 中绑定：

1. **进入 Pages 项目**
2. **Settings** → **Custom domains**
3. **Add custom domain**
4. 输入你的域名，按提示完成 DNS 配置

## 🔐 安全建议

⚠️ **生产环境注意**:
1. 更改 JWT secret key (`demo-secret-key` → 随机强密钥)
2. 使用 bcrypt 替代 SHA-256 哈希
3. 使用 AES-256 或 ChaCha20 替代 XOR 加密
4. 启用 HTTPS only (Cloudflare 自动处理)
5. 定期更新依赖项

## 📝 文件结构

```
.
├── public/
│   └── index.html           # 前端单页应用
├── functions/
│   └── api/
│       └── [[path]].js      # API 路由处理器
├── schema-v2.sql            # D1 数据库 schema
├── wrangler.json            # Pages 配置
├── _redirects               # SPA 重定向规则
└── package.json             # 依赖项
```

## 🐛 故障排除

### 页面显示空白
- 检查 Pages 构建日志（Dashboard → Pages → 项目 → Deployments）
- 确保 `public/index.html` 存在
- 检查浏览器控制台错误 (F12)

### API 调用失败 (401/404)
- 确认 D1 绑定已配置 (Settings → Functions → D1 Database Bindings)
- 确认数据库表已创建 (D1 → SQL Editor)
- 检查 API 路由是否正确 (`/api/auth/login` 不是 `/auth/login`)

### D1 数据库错误
- 重新执行 schema SQL
- 检查 D1 绑定变量名是否为 `DB`
- 查看 Pages Functions 日志 (Dashboard → 项目 → Logs)

## 📞 支持

如有问题，请检查:
1. Cloudflare Dashboard 日志
2. 浏览器 DevTools Console
3. Pages 构建输出
4. GitHub commit 历史

---

**最后更新**: 2025-11-30
**版本**: 2.0 (Full Auth + Encryption)
