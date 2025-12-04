# Quick Export Guide

## To Make Your Blog Post Visible on Live Website:

### Step 1: Export from Admin Panel
1. Go to admin panel: `https://arunjaiswal.com.np/admin/admin-login.html`
2. Login
3. Click "Export Blog" in the sidebar
4. Click "Download blog.json"
5. The file will download to your computer

### Step 2: Upload to GitHub
1. Go to: `https://github.com/jaisarun53/New-Portfolio`
2. Navigate to `data/` folder
3. Click on `blog.json`
4. Click the pencil icon (Edit)
5. Delete all content
6. Open your downloaded `blog.json` file
7. Copy all content and paste into GitHub editor
8. Click "Commit changes" at the bottom
9. Your post will be live in 1-2 minutes!

---

**OR use Git (if you have it set up):**
```bash
# After downloading blog.json
# Replace the file in data/ folder
git add data/blog.json
git commit -m "Update blog posts"
git push origin main
```

