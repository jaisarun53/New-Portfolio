# MongoDB + Node.js Backend Deployment Guide

This guide will help you deploy your MongoDB + Node.js/Express backend and connect it to your portfolio website.

## 📋 Prerequisites

- GitHub account
- MongoDB Atlas account (free tier available)
- Railway/Render/Vercel account (free tier available)

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account
   - Create a new organization (or use default)

2. **Create a Cluster**
   - Click **"Build a Database"**
   - Choose **FREE (M0) Shared** cluster
   - Select a cloud provider and region (closest to you)
   - Click **"Create"** (takes 3-5 minutes)

3. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Authentication Method: **Password**
   - Username: `blogadmin` (or your choice)
   - Password: Click **"Autogenerate Secure Password"** and **SAVE IT!**
   - Database User Privileges: **Read and write to any database**
   - Click **"Add User"**

4. **Whitelist IP Address**
   - Go to **Network Access** → **Add IP Address**
   - For development: Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - For production: Add your server IP addresses
   - Click **"Confirm"**

5. **Get Connection String**
   - Go to **Clusters** → Click **"Connect"**
   - Choose **"Connect your application"**
   - Driver: **Node.js**, Version: **5.5 or later**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `portfolio-blog` (or your choice)
   - Example: `mongodb+srv://blogadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/portfolio-blog?retryWrites=true&w=majority`

## 🚀 Step 2: Deploy Backend to Railway (Recommended)

### Option A: Railway (Easiest)

1. **Sign Up**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click **"New Project"**
   - Select **"Deploy from GitHub repo"**
   - Choose your repository
   - Railway will detect Node.js automatically

3. **Configure Environment Variables**
   - Go to your project → **Variables** tab
   - Add: `MONGODB_URI` = your MongoDB connection string
   - Add: `PORT` = `3000` (optional, Railway auto-assigns)

4. **Configure Build Settings**
   - Go to **Settings** → **Root Directory**
   - Set to: `backend`
   - Railway will auto-detect `package.json` and run `npm install`

5. **Deploy**
   - Railway will automatically deploy
   - Wait for deployment to complete
   - Copy your app URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. **Sign Up**
   - Go to [Render](https://render.com)
   - Sign up with GitHub

2. **Create Web Service**
   - Click **"New"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `portfolio-blog-api`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**
   - Go to **Environment** tab
   - Add: `MONGODB_URI` = your MongoDB connection string
   - Add: `PORT` = `3000`

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment
   - Copy your app URL (e.g., `https://your-app.onrender.com`)

### Option C: Vercel (Serverless)

1. **Sign Up**
   - Go to [Vercel](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository
   - Configure:
     - **Root Directory**: `backend`
     - **Framework Preset**: Other
     - **Build Command**: `npm install`
     - **Output Directory**: Leave empty

3. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add: `MONGODB_URI` = your MongoDB connection string

4. **Deploy**
   - Click **"Deploy"**
   - Wait for deployment
   - Copy your app URL

## 🔗 Step 3: Connect Frontend to Backend

1. **Open Admin Dashboard**
   - Go to your website: `https://your-domain.com/admin-login.html`
   - Login with your admin credentials

2. **Configure API URL**
   - Go to **Settings** section
   - Find **"Database API Configuration"**
   - Enter your backend URL (e.g., `https://your-app.railway.app`)
   - Click **"Save & Test Connection"**
   - You should see: ✅ Database API connected

3. **Test It**
   - Go to **"New Post"** section
   - Create a test blog post
   - Click **"Save Post"**
   - You should see: ✅ Post saved to database successfully!

## ✅ Step 4: Verify Everything Works

1. **Check Backend Health**
   - Visit: `https://your-backend-url.com/api/health`
   - Should return: `{"status":"ok","message":"Blog API is running"}`

2. **Check Posts Endpoint**
   - Visit: `https://your-backend-url.com/api/posts`
   - Should return JSON array of posts

3. **Test from Admin Panel**
   - Create a new post
   - Edit an existing post
   - Delete a post
   - All should work seamlessly!

## 🔒 Security Notes

- **Never commit `.env` file** to Git
- **Use environment variables** for all sensitive data
- **Restrict MongoDB IP whitelist** in production
- **Consider adding authentication** to API endpoints for production

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string is correct
- Verify IP is whitelisted in MongoDB Atlas
- Check Railway/Render logs for errors

### API connection fails
- Verify backend URL is correct (no trailing slash)
- Check CORS is enabled in backend (already configured)
- Test backend health endpoint directly

### Posts not appearing
- Check MongoDB connection
- Verify posts are being saved (check MongoDB Atlas dashboard)
- Clear browser localStorage and reload

## 📚 Next Steps

- Add authentication to API (JWT tokens)
- Add rate limiting
- Add image upload functionality
- Add search functionality
- Add pagination for posts

## 🎉 You're Done!

Your blog now uses MongoDB database instead of JSON files. Posts are saved directly to the database and appear instantly on your website!

