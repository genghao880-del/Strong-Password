# 管理员功能测试脚本

## 测试前准备
1. 确保数据库已更新（运行 migration-add-admin.sql）
2. 设置至少一个用户为管理员
3. 获取管理员用户的 JWT token

## 测试步骤

### 1. 测试系统统计 API
```powershell
# 替换 YOUR_TOKEN 为实际的 JWT token
$token = "YOUR_TOKEN"
$apiBase = "https://your-domain.com"

# 获取系统统计
curl "$apiBase/api/admin/stats" -H "Authorization: Bearer $token"
```

预期返回：
```json
{
  "total_users": 5,
  "total_admins": 1,
  "total_passwords": 20,
  "users_with_2fa": 2
}
```

### 2. 测试用户列表 API
```powershell
# 获取所有用户
curl "$apiBase/api/admin/users" -H "Authorization: Bearer $token"
```

### 3. 测试用户详情 API
```powershell
# 查看用户 ID 为 2 的详情
curl "$apiBase/api/admin/users/2" -H "Authorization: Bearer $token"
```

### 4. 测试设置管理员权限
```powershell
# 将用户 ID 2 设置为管理员
curl -X PATCH "$apiBase/api/admin/users/2/admin" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"is_admin": 1}'
```

### 5. 测试撤销管理员权限
```powershell
# 撤销用户 ID 2 的管理员权限
curl -X PATCH "$apiBase/api/admin/users/2/admin" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"is_admin": 0}'
```

### 6. 测试查看所有密码
```powershell
# 获取所有用户的密码信息
curl "$apiBase/api/admin/passwords" -H "Authorization: Bearer $token"
```

### 7. 测试删除用户（谨慎！）
```powershell
# 删除用户 ID 3（注意：这会删除用户的所有数据）
curl -X DELETE "$apiBase/api/admin/users/3" `
  -H "Authorization: Bearer $token"
```

## 前端测试

### 1. 测试管理员面板访问
1. 使用管理员账号登录
2. 检查右上角是否显示 👑 按钮
3. 点击进入管理员面板

### 2. 测试仪表板
- 验证统计数据是否正确显示
- 检查各个卡片的数字和图标

### 3. 测试用户管理
- 切换到"用户管理"标签
- 验证用户列表是否正确显示
- 点击"查看详情"按钮，验证用户详情页面
- 测试设置/撤销管理员按钮
- 返回用户列表

### 4. 测试密码总览
- 切换到"密码总览"标签
- 验证所有用户的密码是否正确显示
- 检查用户邮箱和密码关联是否正确

### 5. 测试权限验证
1. 登出管理员账号
2. 使用普通用户账号登录
3. 验证右上角没有 👑 按钮
4. 尝试直接访问管理员 API（应该返回 403）

## 安全测试

### 1. 测试无 Token 访问
```powershell
# 不带 Authorization header
curl "$apiBase/api/admin/stats"
```
预期：返回 401 Unauthorized

### 2. 测试非管理员访问
```powershell
# 使用普通用户的 token
$normalUserToken = "NORMAL_USER_TOKEN"
curl "$apiBase/api/admin/stats" -H "Authorization: Bearer $normalUserToken"
```
预期：返回 403 Forbidden

### 3. 测试删除自己
```powershell
# 尝试删除自己的账号（假设管理员 ID 为 1）
curl -X DELETE "$apiBase/api/admin/users/1" `
  -H "Authorization: Bearer $token"
```
预期：返回 400，提示无法删除自己

### 4. 测试撤销自己的管理员权限
```powershell
# 尝试撤销自己的管理员权限
curl -X PATCH "$apiBase/api/admin/users/1/admin" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"is_admin": 0}'
```
预期：返回 400，提示无法撤销自己的权限

## 检查清单

- [ ] 数据库迁移成功
- [ ] 首个管理员设置成功
- [ ] 管理员可以登录并看到 👑 按钮
- [ ] 仪表板统计数据正确
- [ ] 用户列表显示正常
- [ ] 用户详情查看正常
- [ ] 设置/撤销管理员权限功能正常
- [ ] 密码总览显示正常
- [ ] 删除用户功能正常（级联删除）
- [ ] 普通用户无法访问管理员功能
- [ ] 管理员无法删除自己
- [ ] 管理员无法撤销自己的权限
- [ ] 所有 API 都需要正确的 JWT 验证

## 常见问题排查

### 问题：管理员登录后看不到 👑 按钮
检查：
```sql
SELECT id, email, is_admin FROM users WHERE email = 'admin@example.com';
```
确保 `is_admin` 值为 1

### 问题：API 返回 500 错误
检查：
1. Cloudflare Workers 日志
2. 数据库是否正确迁移
3. JWT_SECRET 是否配置

### 问题：前端显示空数据
检查：
1. 浏览器控制台错误
2. Network 标签中 API 响应
3. JWT token 是否有效
