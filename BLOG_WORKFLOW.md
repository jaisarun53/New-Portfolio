# 📝 Blog Publishing Workflow

## ⚠️ IMPORTANT: How to Make Your Blog Posts Visible

After creating or editing blog posts in the admin panel, **they won't appear on your website until you export and upload the blog.json file**.

## 🔄 Complete Workflow

### Step 1: Create/Edit Post in Admin Panel
1. Login to admin panel: `https://arunjaiswal.com.np/admin-login.html`
2. Create or edit your blog post
3. Click "Save Post"
4. You'll be prompted to export - click "Yes"

### Step 2: Export blog.json
1. Go to "Export Blog" section (or click Yes when prompted)
2. Click "Download blog.json"
3. The file will download to your computer

### Step 3: Upload to GitHub
1. Go to your GitHub repository: `https://github.com/jaisarun53/New-Portfolio`
2. Click "Upload files" or drag and drop `blog.json`
3. **Replace** the existing `blog.json` file
4. Add commit message: "Update blog posts"
5. Click "Commit changes"

### Step 4: Wait for Deployment
- GitHub Pages takes 1-2 minutes to update
- Refresh your website to see the new posts

## 🎯 Quick Method (Using Git)

If you have Git set up locally:

```bash
# After exporting blog.json from admin panel
git add blog.json
git commit -m "Update blog posts"
git push origin main
```

## ❓ Why This Workflow?

Since your website is static (no backend server), blog posts are stored in the `blog.json` file. When you create posts in the admin panel:

1. **Posts are saved to browser localStorage** (temporary, browser-specific)
2. **You export to blog.json** (downloads the file)
3. **You upload blog.json to GitHub** (makes it available on your server)
4. **Your website loads from blog.json** (visitors see your posts)

## 💡 Tips

- **Export after every change**: Create/edit/delete → Export → Upload
- **Check before publishing**: Verify posts look correct in admin panel
- **Backup**: Keep old blog.json files as backup
- **Batch updates**: Create multiple posts, then export once

## 🚨 Troubleshooting

### Posts not showing on website?
1. ✅ Did you export blog.json?
2. ✅ Did you upload it to GitHub?
3. ✅ Did you commit and push?
4. ✅ Wait 1-2 minutes for GitHub Pages to update
5. ✅ Hard refresh your website (Ctrl+F5)

### Posts showing in admin but not on website?
- This is normal! Admin panel shows localStorage posts
- Export blog.json and upload to make them visible

### Want to see posts immediately?
- The admin panel shows all posts (localStorage + server)
- Your website only shows posts from blog.json (server file)

---

**Remember: Export → Upload → Wait → Refresh!** 🚀

