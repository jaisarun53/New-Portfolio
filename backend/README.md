# Blog Backend API

Node.js + Express + MongoDB backend for the portfolio blog.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up MongoDB Atlas (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (free tier: M0)
4. Go to **Database Access** → Create a database user
5. Go to **Network Access** → Add IP Address (0.0.0.0/0 for all IPs, or your specific IP)
6. Go to **Database** → Click **Connect** → Choose **Connect your application**
7. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/portfolio-blog?retryWrites=true&w=majority
   PORT=3001
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

The server will run on `http://localhost:3001`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/posts` - Get all blog posts
- `GET /api/posts/:id` - Get single blog post
- `POST /api/posts` - Create new blog post
- `PUT /api/posts/:id` - Update blog post
- `DELETE /api/posts/:id` - Delete blog post

## Deployment

### Option 1: Railway (Recommended - Free Tier Available)

1. Go to [Railway](https://railway.app)
2. Create account and new project
3. Connect your GitHub repository
4. Add environment variable: `MONGODB_URI`
5. Deploy!

### Option 2: Render (Free Tier Available)

1. Go to [Render](https://render.com)
2. Create account
3. New → Web Service
4. Connect repository
5. Add environment variable: `MONGODB_URI`
6. Deploy!

### Option 3: Vercel (Serverless Functions)

Requires converting to serverless functions. See Vercel documentation.

## Testing

Test the API using curl or Postman:

```bash
# Get all posts
curl http://localhost:3001/api/posts

# Create a post
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"<p>Hello World</p>","date":"2025-01-28","category":"Test"}'
```

