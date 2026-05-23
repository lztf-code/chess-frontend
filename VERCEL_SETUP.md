# Vercel 设置超详细指南 📖

## 后端已部署！✅
后端 URL：https://xiangqihouduan.onrender.com

## 第一步：添加环境变量

### 1. 打开 Vercel
访问：https://vercel.com/dashboard

### 2. 进入项目
找到并点击您的 **chess-games** 项目

### 3. 打开设置
点击顶部的 **"Settings"** 标签页

### 4. 找到环境变量
在左侧菜单中，找到并点击 **"Environment Variables"**

### 5. 添加新变量
点击 **"Add New"** 按钮

### 6. 填写信息
- **Name**（名称）：`VITE_SERVER_URL`
- **Value**（值）：`https://xiangqihouduan.onrender.com`
- **Environment**（环境）：选择 **Production**
- 确保勾选 **Automatically expose System Environment Variables**

### 7. 保存
点击 **"Save"** 按钮

## 第二步：重新部署

### 1. 回到项目主页
点击顶部的 **"Project"** 标签（或者项目名称）

### 2. 找到最新部署
在页面中找到最新的一次部署记录（通常在最上面）

### 3. 重新部署
- 点击部署记录右边的 **"..."**（三个点的菜单按钮）
- 选择 **"Redeploy"**
- 在弹出的窗口中点击 **"Redeploy"** 确认

### 4. 等待完成
等待 1-2 分钟，直到部署状态变为 **Ready**

## 第三步：完成！🎉

访问您的网站：https://chess-games-liard.vercel.app

现在您可以创建房间了！

---

## 验证是否成功

1. 打开浏览器开发者工具（F12）
2. 点击 Console 标签
3. 输入昵称并进入大厅
4. 看看是否有 Socket 连接成功的消息
5. 尝试创建房间！
