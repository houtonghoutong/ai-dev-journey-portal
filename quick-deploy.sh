#!/bin/bash

# 优化的部署脚本 - AI Dev Journey Portal
# 不上传 venv 目录，在服务器上重新创建

set -e

SERVER="root@223.109.142.31"
DEPLOY_DIR="/var/www/ai-dev-journey-portal"

echo "🚀 开始优化部署到京东云服务器..."

# 1. 确保本地已构建
echo ""
echo "📦 第1步: 检查构建文件..."
if [ ! -d "dist" ]; then
    echo "构建前端..."
    npm run build
else
    echo "✅ 构建文件已存在"
fi

# 2. 创建临时目录并打包后端(排除venv)
echo ""
echo "📦 第2步: 打包后端文件(不包含venv)..."
TEMP_DIR=$(mktemp -d)
mkdir -p "$TEMP_DIR/backend"

# 复制后端文件但排除 venv 和 __pycache__
rsync -av --exclude='venv' --exclude='__pycache__' --exclude='*.pyc' backend/ "$TEMP_DIR/backend/"

# 打包
cd "$TEMP_DIR"
tar -czf backend.tar.gz backend/
cd -

echo "✅ 后端文件打包完成"

# 3. 上传文件
echo ""
echo "📤 第3步: 上传文件到服务器..."

# 首先确保服务器目录存在
ssh "$SERVER" "mkdir -p $DEPLOY_DIR"

# 上传前端
echo "上传前端文件..."
scp -r dist "$SERVER:$DEPLOY_DIR/"

# 上传后端压缩包
echo "上传后端文件..."
scp "$TEMP_DIR/backend.tar.gz" "$SERVER:/tmp/"

# 清理本地临时文件
rm -rf "$TEMP_DIR"

echo "✅ 文件上传完成"

# 4. 服务器端配置和部署
echo ""
echo "🔧 第4步: 在服务器上配置和部署..."

ssh "$SERVER" << 'REMOTE_SCRIPT'
set -e

DEPLOY_DIR="/var/www/ai-dev-journey-portal"

# 解压后端文件
cd "$DEPLOY_DIR"
tar -xzf /tmp/backend.tar.gz
rm /tmp/backend.tar.gz

cd backend

echo "检查并安装系统依赖..."
# 检查并安装 Python3
if ! command -v python3 &> /dev/null; then
    echo "安装 Python3..."
    yum install -y python3 python3-pip
fi

echo "创建 Python 虚拟环境..."
if [ -d "venv" ]; then
    rm -rf venv
fi
python3 -m venv venv

echo "安装 Python 依赖..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 创建 .env 文件
if [ ! -f ".env" ]; then
    echo "创建环境配置文件..."
    cat > .env << 'EOF'
DATABASE_URL=sqlite:///./app.db
CORS_ORIGINS=http://223.109.142.31,http://localhost:3000
DEBUG=False
OPENAI_API_KEY=your_openai_api_key
EOF
fi

echo "配置后端 systemd 服务..."
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

systemctl daemon-reload
systemctl enable ai-dev-journey-backend
systemctl restart ai-dev-journey-backend

# 检查服务状态
sleep 2
if systemctl is-active --quiet ai-dev-journey-backend; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败，查看日志:"
    journalctl -u ai-dev-journey-backend -n 20 --no-pager
    exit 1
fi

# 配置 Nginx
echo "配置 Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    yum install -y nginx
fi

cat > /etc/nginx/conf.d/ai-dev-journey-portal.conf << 'EOF'
server {
    listen 80;
    server_name 223.109.142.31;

    # 前端静态文件
    location / {
        root /var/www/ai-dev-journey-portal/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 测试并重启 Nginx
nginx -t
if [ $? -eq 0 ]; then
    systemctl enable nginx
    systemctl restart nginx
    echo "✅ Nginx 配置成功"
else
    echo "❌ Nginx 配置错误"
    exit 1
fi

# 配置防火墙
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-service=http 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo "✅ 防火墙配置完成"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 服务器部署完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
REMOTE_SCRIPT

# 5. 验证部署
echo ""
echo "🔍 第5步: 验证部署..."
sleep 3

echo "检查后端服务状态..."
ssh "$SERVER" "systemctl status ai-dev-journey-backend --no-pager | head -n 15"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ 部署全部完成！"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 访问地址:"
echo "   🌐 前端:     http://223.109.142.31/"
echo "   🔌 API健康:  http://223.109.142.31/api/health"
echo "   📚 API文档:  http://223.109.142.31/api/docs"
echo ""
echo "💡 常用命令:"
echo "   查看后端日志:  ssh $SERVER 'journalctl -u ai-dev-journey-backend -f'"
echo "   查看Nginx日志: ssh $SERVER 'tail -f /var/log/nginx/error.log'"
echo "   重启后端:      ssh $SERVER 'systemctl restart ai-dev-journey-backend'"
echo "   重启Nginx:     ssh $SERVER 'systemctl restart nginx'"
echo ""
