#!/bin/bash

echo "🚀 Setting up B2B Smart Chat Platform..."

# 检查 Node.js 版本
echo "📋 Checking Node.js version..."
node_version=$(node -v)
echo "Node.js version: $node_version"

# 安装依赖
echo "📦 Installing dependencies..."
npm install

# 创建环境变量文件
if [ ! -f .env.local ]; then
    echo "⚙️ Creating environment file..."
    cat > .env.local << EOL
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://tpmwqivhmxxhwriolpok.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwbXdxaXZobXh4aHdyaW9scG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMTUzNjUsImV4cCI6MjA2OTY5MTM2NX0.djTBgHUG2o667K3NYEzeFMXJZhf_BifOKr9ivg_ocV4

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOL
    echo "Please edit .env.local with your Supabase credentials"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase URL and API key"
echo "2. Run the database setup in your Supabase dashboard"
echo "3. Start development server: npm run dev"
