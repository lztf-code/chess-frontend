# Railway 部署指南

## 后端部署步骤

### 1. 准备工作
确保你有以下内容：
- GitHub 账户
- Railway 账户 (可使用 GitHub 登录)
- 代码已推送到 GitHub 仓库

### 2. 在 Railway 上部署后端

#### 步骤 1：登录 Railway
- 访问 [https://railway.app](https://railway.app)
- 使用 GitHub 账户登录

#### 步骤 2：创建新项目
1. 点击 "New Project"
2. 选择 "Deploy from repo"
3. 连接你的 GitHub 账户并授权
4. 选择包含 chess-games 项目的仓库

#### 步骤 3：配置项目
1. 在项目设置中，设置 "Root Directory" 为 `chess-games/server`
2. 确保 Railway 能够检测到 `package.json` 和 `railway.json`

#### 步骤 4：部署
1. 点击 "Deploy"
2. 等待构建和部署完成
3. 部署成功后，Railway 会提供一个公共 URL (例如 `https://your-project-name.up.railway.app`)

### 3. 更新前端配置

#### 步骤 1：设置环境变量
1. 在项目根目录创建 `.env` 文件（已提供 `.env.example` 作为模板）
2. 将 `VITE_SERVER_URL` 设置为你在 Railway 上部署的后端 URL

```env
VITE_SERVER_URL=https://your-project-name.up.railway.app
```

#### 步骤 2：重新部署前端
1. 将环境变量添加到 Vercel 项目设置中
2. 重新部署前端到 Vercel

### 项目结构说明
```
chess-games/
├── server/          # 后端代码 (Socket.IO + Express)
│   ├── package.json
│   ├── railway.json # Railway 配置文件
│   └── ...
├── src/             # 前端代码 (React + Vite)
└── ...
```
