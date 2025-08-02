# B2B Smart Chat Platform

一个现代化的B2B智能聊天平台，连接全球买家与供应商。

## ✨ 核心功能

- 🔍 **智能关键词搜索** - 基于产品关键词匹配合适的聊天室
- 🏠 **自动聊天室创建** - 找不到合适聊天室时自动创建
- 💬 **实时聊天** - 基于 WebSocket 的实时消息传递
- 🌐 **多语言支持** - 支持中英文界面切换
- 👥 **用户类型区分** - 买家和供应商身份标识
- 📱 **响应式设计** - 支持桌面端和移动端

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase 账户

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd b2b-smart-chat-platform
```

2. **安装依赖**
```bash
npm install
```

3. **环境配置**
```bash
cp .env.example .env.local
# 编辑 .env.local 添加你的 Supabase 配置
```

4. **数据库设置