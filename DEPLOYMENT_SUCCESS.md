# 🎉 AI Dev Journey Portal 部署成功！

## 📋 部署信息

- **服务器**: 京东云 223.109.142.31
- **部署时间**: 2026-01-04 11:42:36 CST
- **部署目录**: `/var/www/ai-dev-journey-portal`
- **服务状态**: ✅ 运行中

## 🌐 访问地址

### 前端应用
- **主页**: http://223.109.142.31/
- **描述**: AI开发旅程展示门户

### 后端 API  
- **健康检查**: http://223.109.142.31/api/health
- **API文档(Swagger)**: http://223.109.142.31/api/docs
- **API文档(ReDoc)**: http://223.109.142.31/api/redoc
- **OpenAPI规范**: http://223.109.142.31/api/openapi.json

## 📦 部署架构

```
用户浏览器
    ↓
Nginx (80端口) - 前端静态文件 + API反向代理
    ↓
FastAPI Backend (8000端口)
    ↓
SQLite 数据库
```

### 技术栈
- **前端**: Vite + React + TypeScript
- **后端**: FastAPI + Python 3.10
- **Web服务器**: Nginx
- **数据库**: SQLite
- **进程管理**: systemd

## 🛠️ 服务管理

### 后端服务

```bash
# 查看服务状态
ssh root@223.109.142.31 'systemctl status ai-dev-journey-backend'

# 启动服务
ssh root@223.109.142.31 'systemctl start ai-dev-journey-backend'

# 停止服务
ssh root@223.109.142.31 'systemctl stop ai-dev-journey-backend'

# 重启服务
ssh root@223.109.142.31 'systemctl restart ai-dev-journey-backend'

# 查看实时日志
ssh root@223.109.142.31 'journalctl -u ai-dev-journey-backend -f'

# 查看最近日志
ssh root@223.109.142.31 'journalctl -u ai-dev-journey-backend -n 50'
```

### Nginx 服务

```bash
# 查看 Nginx 状态
ssh root@223.109.142.31 'systemctl status nginx'

# 重启 Nginx
ssh root@223.109.142.31 'systemctl restart nginx'

# 测试配置
ssh root@223.109.142.31 'nginx -t'

# 查看错误日志
ssh root@223.109.142.31 'tail -f /var/log/nginx/error.log'

# 查看访问日志
ssh root@223.109.142.31 'tail -f /var/log/nginx/access.log'
```

## 🔄 更新部署

当代码有更新时，执行以下步骤：

### 方法1: 使用快速部署脚本（推荐）

```bash
# 1. 本地构建（如果前端有变化）
npm run build

# 2. 执行部署脚本
./quick-deploy.sh
```

### 方法2: 手动更新

```bash
# 1. 本地构建前端
npm run build

# 2. 上传前端文件
scp -r dist root@223.109.142.31:/var/www/ai-dev-journey-portal/

# 3. 如果后端有变化，打包并上传
tar -czf backend.tar.gz --exclude='venv' --exclude='__pycache__' backend/
scp backend.tar.gz root@223.109.142.31:/tmp/

# 4. 在服务器上更新后端
ssh root@223.109.142.31
cd /var/www/ai-dev-journey-portal
tar -xzf /tmp/backend.tar.gz
cd backend
source venv/bin/activate
pip install -r requirements.txt  # 如果依赖有变化
systemctl restart ai-dev-journey-backend
```

## 📝 配置文件位置

### 服务器上的关键文件

```
/var/www/ai-dev-journey-portal/
├── dist/                          # 前端构建文件
│   ├── index.html
│   └── assets/
├── backend/                       # 后端代码
│   ├── main.py                    # FastAPI 应用入口
│   ├── .env                       # 环境变量配置
│   ├── requirements.txt           # Python 依赖
│   ├── venv/                      # Python 虚拟环境
│   └── app.db                     # SQLite 数据库

/etc/systemd/system/
└── ai-dev-journey-backend.service # 后端服务配置

/etc/nginx/conf.d/
└── ai-dev-journey-portal.conf     # Nginx 配置
```

### 环境变量配置

位置: `/var/www/ai-dev-journey-portal/backend/.env`

```env
DATABASE_URL=sqlite:///./app.db
CORS_ORIGINS=http://223.109.142.31,http://localhost:3000
DEBUG=False
OPENAI_API_KEY=your_openai_api_key
```

## 🔧 故障排查

### 后端无法访问

1. 检查服务状态
```bash
ssh root@223.109.142.31 'systemctl status ai-dev-journey-backend'
```

2. 查看日志
```bash
ssh root@223.109.142.31 'journalctl -u ai-dev-journey-backend -n 100'
```

3. 检查端口占用
```bash
ssh root@223.109.142.31 'netstat -tunlp | grep 8000'
```

### 前端无法访问

1. 检查 Nginx 状态
```bash
ssh root@223.109.142.31 'systemctl status nginx'
```

2. 检查 Nginx 配置
```bash
ssh root@223.109.142.31 'nginx -t'
```

3. 查看 Nginx 错误日志
```bash
ssh root@223.109.142.31 'tail -100 /var/log/nginx/error.log'
```

### API 调用失败

1. 检查 CORS 配置
   - 确保 `.env` 中的 `CORS_ORIGINS` 包含正确的域名

2. 检查后端日志是否有错误

3. 直接测试 API
```bash
curl http://223.109.142.31/api/health
```

## 📊 性能监控

### 检查系统资源

```bash
# CPU 和内存使用
ssh root@223.109.142.31 'top -bn1 | head -20'

# 磁盘使用
ssh root@223.109.142.31 'df -h'

# 后端进程资源使用
ssh root@223.109.142.31 'ps aux | grep uvicorn'
```

## 🔐 安全建议

1. **设置 SSH 密钥登录**（避免每次输入密码）
```bash
# 本地生成密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 复制公钥到服务器
ssh-copy-id root@223.109.142.31
```

2. **配置防火墙**
   - 已自动配置允许 HTTP (80端口)
   - 建议配置 HTTPS (443端口) 和 SSL 证书

3. **定期备份数据库**
```bash
ssh root@223.109.142.31 'cp /var/www/ai-dev-journey-portal/backend/app.db /var/backups/app.db.$(date +%Y%m%d)'
```

## 📞 快速命令参考

```bash
# 完整健康检查
curl http://223.109.142.31/api/health

# 查看所有项目
curl http://223.109.142.31/api/projects

# 重启整个应用栈
ssh root@223.109.142.31 'systemctl restart ai-dev-journey-backend nginx'

# 一键部署更新
./quick-deploy.sh
```

## ✅ 部署验证清单

- [x] 前端可以访问: http://223.109.142.31/
- [x] API 健康检查正常: http://223.109.142.31/api/health
- [x] API 文档可访问: http://223.109.142.31/api/docs
- [x] 后端服务已启动并设为开机自启
- [x] Nginx 已配置并运行
- [x] 防火墙已开放 80 端口

## 🎯 下一步建议

1. **配置域名**: 将域名指向 223.109.142.31
2. **启用 HTTPS**: 使用 Let's Encrypt 配置免费SSL证书
3. **设置监控**: 配置服务监控和告警
4. **数据备份**: 设置定期数据库备份计划
5. **日志管理**: 配置日志轮转，防止日志文件过大

---

**部署完成时间**: 2026-01-04 11:43
**部署状态**: ✅ 成功运行
