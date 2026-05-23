# 快速开始 - 3 步完成部署！🚀（完全免费！）

## 代码已在 GitHub！
仓库：https://github.com/lztf-code/xiangqiHouduan

## 推荐方案：使用 Render（完全免费！）

## 第一步：部署后端到 Render

### 完全免费 - 永久免费额度！

1. **打开 Render**：https://render.com
2. 用 GitHub 登录
3. 点击 **"Sign Up"** → 用 GitHub 注册（免费！）
4. 点击 **"New +"** → **"Web Service"**
5. 选择您的仓库：**xiangqiHouduan**
6. 填写以下配置（**全部免费！**：
   - **Name**: `chess-games-server`
   - **Region**: 选择离您近的（Singapore 或 Tokyo）
   - **Branch**: `main`
   - **Root Directory**: `chess-games/server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: 选择 **Free**（完全免费！）
7. 点击 **"Create Web Service"**

等待 2-3 分钟，部署成功后，复制页面顶部的 URL！

---

## 备选方案：使用 Railway（也有免费额度）

如果 Render 不行，试试 Railway 也有免费方案！

1. **打开 Railway**：https://railway.app
2. 用 GitHub 登录（免费！）
3. 点击 **"New Project"** → **"Empty Project"**
4. 点击 **"+ New"** → **"GitHub Repo"**
5. 选择您的仓库
6. 点击服务 → **Settings** → **Root Directory**: `chess-games/server`
7. 点击 **Deploy**

---

## 第二步：更新前端配置（免费！）

1. 打开 Vercel：https://vercel.com/dashboard
2. 进入您的项目
3. 点击 **"Settings"** → **"Environment Variables"**
4. 添加变量：
   - **Name**: `VITE_SERVER_URL`
   - **Value**: `https://xiangqihouduan.onrender.com`
5. 点击 **"Save"**

### 详细步骤指南：查看 `VERCEL_SETUP.md`！

## 第三步：重新部署前端

1. 回到 Vercel 项目主页
2. 找到最新的部署
3. 点击右边的 **"..."** → **"Redeploy"**

## 完成！🎉（完全免费！）

现在访问：https://chess-games-liard.vercel.app

您就可以创建房间了！

---

## 本地测试

后端服务器正在本地运行中（端口 3001），您可以随时测试！
