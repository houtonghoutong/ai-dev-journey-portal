# 京东云服务器部署指南

## 服务器信息
- **IP地址**: 223.109.142.31
- **用户名**: root
- **访问地址**: http://223.109.142.31/

## 部署步骤

### 1. 本地构建前端

```bash
# 在项目根目录执行
npm run build
```

### 2. 连接服务器

```bash
ssh root@223.109.142.31
# 密码: UMAe8ES/
```

### 3. 服务器环境准备

```bash
# 安装必要软件
yum update -y
yum install -y python3 python3-pip nginx git

# 创建部署目录
mkdir -p /var/www/ai-dev-journey-portal
cd /var/www/ai-dev-journey-portal
```

### 4. 上传文件

在**本地**执行（新开一个终端）:

```bash
# 上传前端构建文件
scp -r dist root@223.109.142.31:/var/www/ai-dev-journey-portal/

# 上传后端文件
scp -r backend root@223.109.142.31:/var/www/ai-dev-journey-portal/
```

### 5. 配置后端

在**服务器**上执行:

```bash
cd /var/www/ai-dev-journey-portal/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install --upgrade pip
pip install -r requirements.txt

# 创建环境配置文件
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./app.db
CORS_ORIGINS=http://223.109.142.31,http://localhost:3000
DEBUG=False
OPENAI_API_KEY=your_openai_api_key
EOF
```

### 6. 配置后端 systemd 服务

```bash
cat > /etc/systemd/system/ai-dev-journey-backend.service << 'EOF'
[Unit]
Description=AI Dev Journey Portal Backend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/ai-dev-journey-portal/backend
Environment="PATH=/var/www/ai-dev-journey-portal/backend/venv/bin"
ExecStart=/var/www/ai-dev-journey-portal/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 启动后端服务
systemctl daemon-reload
systemctl enable ai-dev-journey-backend
systemctl start ai-dev-journey-backend

# 查看服务状态
systemctl status ai-dev-journey-backend
```

### 7. 配置 Nginx

```bash
cat > /etc/nginx/conf.d/ai-dev-journey-portal.conf << 'EOF'
server {
    listen 80;
    server_name 223.109.142.31;

    # 前端静态文件
    location / {
        root /var/www/ai-dev-journey-portal/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 测试 Nginx 配置
nginx -t

# 启动 Nginx
systemctl enable nginx
systemctl restart nginx
```

### 8. 配置防火墙

```bash
# 如果使用 firewalld
firewall-cmd --permanent --add-service=http
firewall-cmd --reload

# 或者如果使用 iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
service iptables save
```

### 9. 验证部署

访问以下链接验证：
- 前端: http://223.109.142.31/
- 后端健康检查: http://223.109.142.31/api/health
- API 文档: http://223.109.142.31/api/docs

### 10. 查看日志

```bash
# 查看后端服务日志
journalctl -u ai-dev-journey-backend -f

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

## 更新部署

当需要更新代码时:

```bash
# 本地构建
npm run build

# 上传新文件
scp -r dist root@223.109.142.31:/var/www/ai-dev-journey-portal/
scp -r backend root@223.109.142.31:/var/www/ai-dev-journey-portal/

# 服务器重启服务
ssh root@223.109.142.31
systemctl restart ai-dev-journey-backend
```

## 故障排查

### 后端服务无法启动
```bash
# 查看详细错误
journalctl -u ai-dev-journey-backend -n 50

# 手动运行检查错误
cd /var/www/ai-dev-journey-portal/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Nginx 配置错误
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 端口被占用
```bash
# 检查端口占用
netstat -tunlp | grep 8000
netstat -tunlp | grep 80
```
