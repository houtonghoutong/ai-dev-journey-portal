#!/bin/bash

# AI Dev Journey Portal 部署脚本
# 目标服务器: 223.109.142.31
# 部署路径: /var/www/ai-dev-journey-portal

set -e

echo "🚀 开始部署 AI Dev Journey Portal..."

# 配置变量
SERVER_IP="223.109.142.31"
SERVER_USER="root"
DEPLOY_PATH="/var/www/ai-dev-journey-portal"
PROJECT_NAME="ai-dev-journey-portal"

# 检查本地构建目录
if [ ! -d "dist" ]; then
    echo "❌ 错误: 未找到 dist 目录，请先运行 npm run build"
    exit 1
fi

echo "📦 打包项目文件..."
# 创建临时目录
TEMP_DIR=$(mktemp -d)
cp -r dist "$TEMP_DIR/"
cp -r backend "$TEMP_DIR/"

# 打包
cd "$TEMP_DIR"
tar -czf "$PROJECT_NAME.tar.gz" dist backend
cd -

echo "📤 上传文件到服务器..."
scp "$TEMP_DIR/$PROJECT_NAME.tar.gz" "$SERVER_USER@$SERVER_IP:/tmp/"

echo "🔧 在服务器上执行部署..."
ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

DEPLOY_PATH="/var/www/ai-dev-journey-portal"
PROJECT_NAME="ai-dev-journey-portal"

echo "📂 创建部署目录..."
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

echo "📦 解压项目文件..."
tar -xzf /tmp/$PROJECT_NAME.tar.gz
rm /tmp/$PROJECT_NAME.tar.gz

echo "🐍 设置后端环境..."
cd backend

# 检查 Python3 是否安装
if ! command -v python3 &> /dev/null; then
    echo "安装 Python3..."
    yum install -y python3 python3-pip
fi

# 创建虚拟环境
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# 激活虚拟环境并安装依赖
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 创建 .env 文件（如果不存在）
if [ ! -f ".env" ]; then
    cat > .env << 'ENVEOF'
# 数据库配置
DATABASE_URL=sqlite:///./app.db

# CORS 配置
CORS_ORIGINS=http://223.109.142.31,http://localhost:3000

# 调试模式
DEBUG=False

# OpenAI API 配置（可选）
OPENAI_API_KEY=your_openai_api_key
ENVEOF
fi

echo "🔧 配置 systemd 服务..."
cat > /etc/systemd/system/ai-dev-journey-backend.service << 'SERVICEEOF'
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

[Install]
WantedBy=multi-user.target
SERVICEEOF

# 重新加载 systemd 并启动服务
systemctl daemon-reload
systemctl enable ai-dev-journey-backend
systemctl restart ai-dev-journey-backend

echo "🌐 配置 Nginx..."
# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    yum install -y nginx
fi

# 配置 Nginx
cat > /etc/nginx/conf.d/ai-dev-journey-portal.conf << 'NGINXEOF'
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
NGINXEOF

# 测试 Nginx 配置
nginx -t

# 启动 Nginx
systemctl enable nginx
systemctl restart nginx

echo "✅ 部署完成！"
echo "📍 访问地址: http://223.109.142.31/"
echo "📊 后端健康检查: http://223.109.142.31/api/health"
echo "📚 API 文档: http://223.109.142.31/api/docs"

# 显示服务状态
systemctl status ai-dev-journey-backend --no-pager
EOF

# 清理临时文件
rm -rf "$TEMP_DIR"

echo ""
echo "✨ 部署完成！"
echo "🌐 前端地址: http://223.109.142.31/"
echo "🔌 后端API: http://223.109.142.31/api/"
echo "📖 API文档: http://223.109.142.31/api/docs"
