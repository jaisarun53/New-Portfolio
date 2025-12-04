# 🚀 Auto-Publish Setup Guide

## One-Click Blog Publishing

Your admin panel now supports **automatic publishing** to GitHub! No more manual export/upload.

## 📋 Setup Instructions

### Step 1: Create GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens/new
2. Give it a name: `Blog Auto-Publish`
3. Select expiration (recommended: 90 days or No expiration)
4. **Check the `repo` permission** (this allows writing to your repository)
5. Click "Generate token"
6. **Copy the token immediately** (it starts with `ghp_`)

### Step 2: Add Token to Admin Panel

1. Login to admin panel: `https://arunjaiswal.com.np/admin/admin-login.html`
2. Go to **Settings** section
3. Find **GitHub Auto-Publish** section
4. Paste your token in the input field
5. Click **Save Token**
6. You should see: ✅ Token configured - Auto-publish enabled

### Step 3: Start Publishing!

Now when you create or edit a blog post:
1. Write your post
2. Click **Save Post**
3. The post will automatically publish to GitHub
4. Wait 1-2 minutes for GitHub Pages to update
5. Your post is live! 🎉

## ✨ Features

- **One-Click Publishing**: Save post = Auto-publish
- **No Manual Steps**: No export, no upload, no Git commands
- **Secure**: Token stored encrypted in browser
- **Individual Post Pages**: Each post has its own page for full reading

## 🔒 Security Notes

- Your GitHub token is stored encrypted in your browser's localStorage
- Only you can see it (it's in your browser)
- You can remove it anytime from Settings
- Token only has access to your repository

## 📖 Reading Blog Posts

- **Blog Listing**: Shows previews with "Read More" link
- **Individual Posts**: Click any post title or "Read More" to read full post
- **Full Content**: Rich text formatting, code blocks, images all work

## 🆘 Troubleshooting

### Auto-publish not working?
1. Check if token is saved (Settings → GitHub Auto-Publish)
2. Verify token has `repo` permission
3. Check browser console for errors (F12)
4. Try removing and re-adding token

### Token expired?
- Create a new token and update it in Settings

### Want to disable auto-publish?
- Remove the token from Settings
- Posts will still save, but you'll need to export manually

---

**Enjoy hassle-free blogging!** 🎉

