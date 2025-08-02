#!/bin/bash

echo "🚀 Deploying B2B Smart Chat Platform..."

# 检查环境变量
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
    exit 1
fi

# 构建项目
echo "🔨 Building project..."
npm run export

# 部署到 Vercel
if command -v vercel &> /dev/null; then
    echo "📤 Deploying to Vercel..."
    vercel --prod
else
    echo "⚠️ Vercel CLI not found. Please install it:"
    echo "npm i -g vercel"
fi

echo "✅ Deployment complete!"
