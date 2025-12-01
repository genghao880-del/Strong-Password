# 管理员功能部署指南

## 一、数据库迁移

### 1. 对于全新部署
直接使用 `schema.sql` 创建数据库：
```powershell
npx wrangler d1 execute password --file=schema.sql --remote
```

### 2. 对于已有数据库
使用迁移脚本添加管理员功能：
```powershell
npx wrangler d1 execute password --file=migration-add-admin.sql --remote
```

## 二、设置首个管理员

### 方法1：通过 SQL 命令
```powershell
# 将特定用户设置为管理员
npx wrangler d1 execute password --command="UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com'" --remote
```

### 方法2：通过 D1 控制台
1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages > D1
3. 选择你的数据库
4. 在 Console 中执行：
```sql
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';
```

## 三、验证管理员权限

1. 使用管理员账号登录系统
2. 在用户界面右上角应该能看到 👑 按钮
3. 点击进入管理员面板
4. 测试各项功能：
   - 查看系统统计
   - 浏览用户列表
   - 查看用户详情
   - 设置其他管理员

## 四、管理员 API 端点

### 认证
所有管理员 API 都需要在 Header 中包含：
```
Authorization: Bearer <your-jwt-token>
```

### 端点列表

#### 1. 获取系统统计
```
GET /api/admin/stats
```
返回：用户总数、管理员数、密码总数、启用2FA的用户数

#### 2. 获取所有用户
```
GET /api/admin/users
```
返回：所有用户的列表及其统计信息

#### 3. 获取用户详情
```
GET /api/admin/users/:id
```
返回：指定用户的详细信息和密码列表

#### 4. 删除用户
```
DELETE /api/admin/users/:id
```
删除指定用户及其所有数据（密码、恢复码等）

#### 5. 设置/撤销管理员
```
PATCH /api/admin/users/:id/admin
Body: { "is_admin": 0 或 1 }
```

#### 6. 查看所有密码
```
GET /api/admin/passwords
```
返回：所有用户的密码信息（不含明文密码）

## 五、安全注意事项

1. **管理员权限保护**：
   - 管理员无法删除自己的账号
   - 管理员无法撤销自己的管理员权限
   - 所有管理员操作都需要 JWT 验证

2. **数据隐私**：
   - 管理员查看密码列表时不会显示密码明文
   - 只显示网站、用户名、标签等元数据

3. **审计建议**：
   - 建议记录所有管理员操作日志
   - 定期审查管理员列表
   - 遵循最小权限原则

## 六、常见问题

### Q: 如何查看当前有哪些管理员？
```powershell
npx wrangler d1 execute password --command="SELECT id, email, is_admin FROM users WHERE is_admin = 1" --remote
```

### Q: 如何批量设置管理员？
```sql
UPDATE users SET is_admin = 1 WHERE email IN ('admin1@example.com', 'admin2@example.com');
```

### Q: 管理员面板无法访问？
检查：
1. 用户的 `is_admin` 字段是否为 1
2. JWT token 是否有效
3. 浏览器控制台是否有错误信息

### Q: 如何撤销所有管理员权限？
```sql
-- 保留一个主管理员，撤销其他所有
UPDATE users SET is_admin = 0 WHERE email != 'main-admin@example.com';
```

## 七、更新日志

### v1.0 - 管理员功能首次发布
- ✅ 添加管理员角色和权限系统
- ✅ 管理员仪表板与统计功能
- ✅ 用户管理（查看、删除、权限设置）
- ✅ 全局密码查看功能
- ✅ 数据库迁移脚本
