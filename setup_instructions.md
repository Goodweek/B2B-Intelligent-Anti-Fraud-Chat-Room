# 📦 B2B Smart Chat Platform - 详细安装指南

## 🎯 快速部署 (5分钟上线)

### 步骤 1: 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 注册并创建新项目
3. 等待项目初始化完成

### 步骤 2: 设置数据库

1. 在 Supabase 控制台，进入 **SQL Editor**
2. 复制 `database/schema.sql` 的内容
3. 粘贴并运行 SQL 脚本
4. 确认所有表创建成功

### 步骤 3: 启用 Realtime

1. 在 Supabase 控制台，进入 **Database > Replication**
2. 启用以下表的 Realtime：
   - `messages`
   - `chatrooms`

### 步骤 4: 获取 API 密钥

1. 进入 **Settings > API**
2. 复制以下信息：
   - Project URL
   - anon public key

### 步骤 5: 部署到 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 导入 GitHub 项目
3. 添加环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=你的项目URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
   ```
4. 点击 Deploy

## 🖥️ 本地开发环境

### 1. 项目设置

```bash
# 克隆项目
git clone <your-repo-url>
cd b2b-smart-chat-platform

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env.local
```

### 2. 配置环境变量

编辑 `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

## 📁 文件目录结构

```
b2b-smart-chat-platform/
├── 📱 app/                    # Next.js 页面
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 主页
│   └── globals.css           # 全局样式
├── 🧩 components/            # React 组件
│   ├── KeywordSearch.tsx     # 搜索组件
│   ├── ChatRoom.tsx          # 聊天室
│   ├── AuthForm.tsx          # 登录注册
│   └── Layout.tsx            # 布局组件
├── 📚 lib/                   # 工具库
│   ├── supabase.ts           # 数据库配置
│   └── utils.ts              # 工具函数
├── 🗄️ store/                 # 状态管理
│   └── chatStore.ts          # 主要状态
├── 🗃️ database/              # 数据库
│   └── schema.sql            # 建表脚本
├── 🚀 deployment/            # 部署配置
│   ├── vercel.json
│   └── netlify.toml
└── 📜 配置文件
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

## 🔧 自定义配置

### 修改主题颜色

编辑 `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#你的颜色',
    500: '#你的主色',
    600: '#你的深色',
  }
}
```

### 添加新的快速关键词

编辑 `components/KeywordSearch.tsx`:

```javascript
const QUICK_KEYWORDS = [
  '你的关键词1',
  '你的关键词2',
  // ...
]
```

### 修改默认聊天室

编辑 `database/schema.sql` 底部的 INSERT 语句

## 🐛 常见问题

### Q: 部署后无法连接数据库？
A: 检查环境变量是否正确设置，确保 Supabase URL 和 API Key 正确。

### Q: 实时聊天不工作？
A: 确保在 Supabase 控制台启用了 `messages` 表的 Realtime 功能。

### Q: 搜索功能不准确？
A: 检查数据库是否正确创建了全文搜索索引。

### Q: 样式显示异常？
A: 确保 TailwindCSS 正确配置，运行 `npm run build` 检查构建错误。

## 🚀 生产环境优化

### 性能优化

1. **启用 CDN**: Vercel 自动提供全球 CDN
2. **图片优化**: 使用 Next.js Image 组件
3. **代码分割**: 使用动态导入优化包大小

### 安全配置

1. **环境变量**: 生产环境使用不同的 API 密钥
2. **域名限制**: 在 Supabase 设置允许的域名
3. **速率限制**: 配置 API 调用频率限制

### 监控和分析

1. **错误监控**: 集成 Sentry
2. **性能监控**: 使用 Vercel Analytics
3. **用户分析**: 集成 Google Analytics

## 📞 技术支持

- 📧 Email: support@yourplatform.com
- 📚 文档: [docs.yourplatform.com](docs.yourplatform.com)
- 💬 Discord: [discord.gg/yourserver](discord.gg/yourserver)
- 🐛 Bug Report: GitHub Issues

## 🎉 恭喜！

你的 B2B 智能聊天平台现在已经准备就绪！

访问你的网站开始连接全球的买家和供应商吧！