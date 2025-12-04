# Database Setup Guide

This guide will help you set up MongoDB with Node.js + Express backend for your blog.

## 🚀 Quick Start

### Step 1: Set Up MongoDB Atlas (Free Cloud Database)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose **FREE (M0)** tier
   - Select a cloud provider and region (closest to you)
   - Click "Create"

3. **Create Database User**
   - Go to **Database Access** → **Add New Database User**
   - Username: `blogadmin` (or your choice)
   - Password: Generate a strong password (save it!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

4. **Configure Network Access**
   - Go to **Network Access** → **Add IP Address**
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add your specific IP address
   - Click "Confirm"

5. **Get Connection String**
   - Go to **Database** → Click **Connect** on your cluster
   - Choose **Connect your application**
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/portfolio-blog?retryWrites=true&w=majority`
   - **Replace `<password>` with your actual password**

### Step 2: Set Up Backend Server

1. **Navigate to Backend Folder**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Copy `env.example` to `.env`:
     ```bash
     cp env.example .env
     ```
   - Edit `.env` and add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://blogadmin:YOUR_PASSWORD@cluster.mongodb.net/portfolio-blog?retryWrites=true&w=majority
     PORT=3001
     ```

4. **Start the Server**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

   The server will run on `http://localhost:3001`

5. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Get all posts
   curl http://localhost:3001/api/posts
   ```

### Step 3: Configure Frontend

1. **Open Admin Dashboard**
   - Go to `admin-dashboard.html`
   - Navigate to **Settings** → **Database API Configuration**

2. **Enter API URL**
   - For local development: `http://localhost:3001/api`
   - For production: Your deployed backend URL (see Step 4)

3. **Test Connection**
   - Click "Save & Test Connection"
   - You should see: ✅ API connected - Database mode enabled

### Step 4: Deploy Backend (Choose One)

#### Option A: Railway (Recommended - Free Tier)

1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variable:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string
6. Railway will auto-deploy
7. Copy the generated URL (e.g., `https://your-app.railway.app`)
8. Update frontend API URL to: `https://your-app.railway.app/api`

#### Option B: Render (Free Tier)

1. Go to [Render](https://render.com)
2. Sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Settings:
   - **Name**: `portfolio-blog-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variable:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB connection string
7. Click "Create Web Service"
8. Copy the URL (e.g., `https://portfolio-blog-api.onrender.com`)
9. Update frontend API URL to: `https://portfolio-blog-api.onrender.com/api`

#### Option C: Vercel (Serverless)

Requires converting to serverless functions. See Vercel documentation.

### Step 5: Update Frontend API URL

1. **In Admin Dashboard Settings:**
   - Enter your deployed backend URL
   - Example: `https://your-app.railway.app/api`

2. **Or Update `api-config.js` directly:**
   ```javascript
   const API_BASE_URL = 'https://your-app.railway.app/api';
   ```

## ✅ Verification

1. **Backend is running** - Check `http://localhost:3001/api/health`
2. **MongoDB is connected** - Check backend console for "✅ Connected to MongoDB"
3. **Frontend can connect** - Test in admin dashboard settings
4. **Create a test post** - Should save to database instantly

## 🔧 Troubleshooting

### "Connection failed" error
- Check MongoDB connection string (password is correct)
- Verify Network Access allows your IP (or 0.0.0.0/0)
- Check backend server is running
- Verify API URL is correct (include `/api` at the end)

### "CORS error" in browser
- Backend already has CORS enabled
- If still issues, check backend is running

### Posts not appearing
- Check browser console for errors
- Verify API URL in settings
- Check backend logs for errors
- Ensure MongoDB connection is active

## 📝 Next Steps

- Your blog now uses a real database!
- Posts are saved instantly to MongoDB
- No more manual JSON file uploads
- Scalable and production-ready

## 🆘 Need Help?

- Check backend console logs
- Check browser console (F12)
- Verify MongoDB Atlas dashboard
- Ensure all environment variables are set

