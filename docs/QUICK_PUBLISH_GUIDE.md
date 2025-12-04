# 🚀 Quick Publish Guide - Make Your Blog Post Live

## ⚠️ IMPORTANT: After Saving a Post

When you save a blog post in the admin panel, it downloads `blog.json` automatically. **You MUST upload this file to GitHub for your post to appear on your live website.**

## 📤 Quick Upload Steps

### Method 1: GitHub Website (Easiest)

1. **After saving post**, `blog.json` downloads automatically
2. Go to: `https://github.com/jaisarun53/New-Portfolio`
3. Click on `data` folder
4. Click on `blog.json` file
5. Click the **pencil icon** (Edit) at top right
6. **Delete all content** in the editor
7. **Open your downloaded `blog.json`** file (from Downloads folder)
8. **Copy all content** and **paste** into GitHub editor
9. Scroll down, add commit message: "Update blog posts"
10. Click **Commit changes**
11. Wait 1-2 minutes
12. Your post is now live! 🎉

### Method 2: Using Git (If you have it)

```bash
# After downloading blog.json
# Replace the file in data/ folder
git add data/blog.json
git commit -m "Update blog posts"
git push origin main
```

## 🔄 Why This is Needed?

- Admin panel saves to **browser localStorage** (temporary)
- Your website loads from **data/blog.json** (server file)
- You need to upload the file to make posts visible to everyone

## 💡 Pro Tip: Auto-Publish

To avoid manual upload every time:

1. Go to **Settings** in admin panel
2. Add your **GitHub Personal Access Token**
3. Posts will auto-publish when you save! ✨

**Get token:** https://github.com/settings/tokens/new (needs `repo` permission)

## ✅ Verify Your Post is Live

After uploading, check:
- `https://arunjaiswal.com.np/#blog` - Should show your post
- `https://arunjaiswal.com.np/blog-post.html?id=1` - Should show full post

---

**Remember:** Save → Download → Upload → Live! 🚀

