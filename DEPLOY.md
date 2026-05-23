# 一键部署指南 🚀

## 推荐方案：使用 Render 部署（最简单！）

### 第一步：将代码推送到 GitHub

1. 在 GitHub 上创建一个新仓库
2. 在本地项目目录运行：
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 第二步：后端部署到 Render (2 分钟)

1. **打开 Render**
   - 访问：https://render.com
   - 点击 "Get Started" 用 GitHub 登录

2. **创建新 Web 服务**
   - 点击 "New +" → "Web Service"
   - 选择您的 chess-games 仓库

3. **配置服务**
   - Name: `chess-games-server`
   - Region: 选择离您近的（例如 Singapore）
   - Branch: `main`
   - Root Directory: `chess-games/server`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: 选择 Free 或 Starter

4. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成（约 2-3 分钟）

5. **获取后端 URL**
   - 部署成功后，复制页面顶部显示的 URL（类似：`https://chess-games-server.onrender.com`）

---

## 备选方案：Railway 部署

### 第一步：后端部署到 Railway (3 分钟)

1. **打开 Railway**
   - 访问：https://railway.app
   - 点击 "Login" 用 GitHub 登录

2. **创建新项目**
   - 点击 "New Project" → "Empty Project"
   - 项目名称：chess-games-server

3. **添加服务**
   - 点击 "+ New" → "GitHub Repo"
   - 连接您的 GitHub 账户
   - 选择您的 chess-games 仓库

4. **配置服务**
   - 点击刚添加的服务
   - 进入 "Settings" 标签
   - 找到 "Root Directory"，设置为：`chess-games/server`
   - 点击 "Deploy"

5. **获取后端 URL**
   - 部署成功后，点击 "Settings" → "Domains"
   - 复制您的 URL（类似：`https://your-name.up.railway.app`）

---

## 第二步：更新前端 (1 分钟)

1. 打开 Vercel 项目：https://vercel.com/dashboard
2. 进入项目 "Settings" → "Environment Variables"
3. 添加新变量：
   - Name: `VITE_SERVER_URL`
   - Value: 您的后端 URL（来自第一步）
4. 点击 "Save"

5. 重新部署：
   - 回到项目主页
   - 点击最新部署的 "..." → "Redeploy"

## 第三步：完成！(1 分钟)

访问您的 Vercel 网址：https://chess-games-liard.vercel.app

现在您可以创建房间了！🎉

---

## 本地开发

如果您想在本地测试，后端服务器已在运行中（端口 3001）。

```bash
# 启动本地前端
cd chess-games
npm run dev
```
