# Blog Backend API

Node.js + Express + MongoDB backend for the portfolio blog.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier: M0)
4. Create a database user:
   - Go to **Database Access** → **Add New Database User**
   - Username: `blogadmin` (or your choice)
   - Password: Generate a secure password (save it!)
   - Database User Privileges: **Read and write to any database**
5. Whitelist your IP:
   - Go to **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0) for development
   - For production, add your server IP
6. Get connection string:
   - Go to **Clusters** → Click **Connect**
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `portfolio-blog` (or your choice)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://blogadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/portfolio-blog?retryWrites=true&w=majority
   PORT=3000
   ```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Blog Posts
- `GET /api/posts` - Get all blog posts (sorted by date, newest first)
- `GET /api/posts/:id` - Get single blog post by ID
- `POST /api/posts` - Create new blog post
- `PUT /api/posts/:id` - Update blog post
- `DELETE /api/posts/:id` - Delete blog post

## Request/Response Examples

### Create Post
```json
POST /api/posts
{
  "title": "My First Post",
  "content": "<p>This is my blog post content</p>",
  "date": "2025-01-28",
  "category": "Technology"
}
```

### Response
```json
{
  "message": "Blog post created successfully",
  "post": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "title": "My First Post",
    "content": "<p>This is my blog post content</p>",
    "date": "2025-01-28",
    "category": "Technology",
    "createdAt": "2025-01-28T10:00:00.000Z",
    "updatedAt": "2025-01-28T10:00:00.000Z"
  }
}
```

## Deployment

### Option 1: Railway (Recommended - Free Tier Available)
1. Go to [Railway](https://railway.app)
2. Sign up with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your repository
5. Add environment variable: `MONGODB_URI` (your MongoDB connection string)
6. Railway will auto-deploy!

### Option 2: Render (Free Tier Available)
1. Go to [Render](https://render.com)
2. Sign up
3. Click **New** → **Web Service**
4. Connect your GitHub repo
5. Build command: `cd backend && npm install`
6. Start command: `cd backend && npm start`
7. Add environment variable: `MONGODB_URI`
8. Deploy!

### Option 3: Vercel (Serverless Functions)
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repo
3. Configure: Root directory = `backend`
4. Add environment variable: `MONGODB_URI`
5. Deploy!

## Security Notes

- Never commit `.env` file to Git
- Use environment variables for sensitive data
- Consider adding authentication for production use
- Use MongoDB Atlas IP whitelisting for production

