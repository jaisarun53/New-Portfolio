# Admin Panel Guide

## 🎉 Welcome to Your Blog Admin Panel!

You now have a fully functional admin panel to manage your blog posts easily, without editing JSON files manually!

## 🔐 Accessing the Admin Panel

1. **Open**: Navigate to `admin-login.html` in your browser
   - Local: `http://localhost:3000/admin-login.html`
   - Live: `https://arunjaiswal.com.np/admin-login.html`

2. **Default Login Credentials**:
   - **Username**: `admin`
   - **Password**: `admin123`

3. **⚠️ IMPORTANT**: Change your password immediately after first login!

## ✨ Features

### 📝 Rich Text Editor
- **Headings** (H1-H6)
- **Text Formatting**: Bold, Italic, Underline, Strikethrough
- **Lists**: Ordered and Bulleted
- **Code Blocks**: Syntax highlighting support
- **Links & Images**: Add hyperlinks and images
- **Colors**: Text and background colors
- **Alignment**: Left, Center, Right, Justify
- **Blockquotes**: For quotes
- **And more!**

### 📊 Blog Management
- **Create Posts**: Write new blog posts with rich formatting
- **Edit Posts**: Update existing posts
- **Delete Posts**: Remove posts you no longer need
- **View All Posts**: See all your blog posts in one place

### 🔒 Security Features
- **Secure Login**: Password hashed with SHA-256
- **Session Management**: Auto-logout after 8 hours
- **Password Change**: Change your password anytime

### 📥 Export Functionality
- **Download blog.json**: Export all posts as JSON file
- **Deploy**: Upload the exported file to your server

## 📖 How to Use

### Creating a New Blog Post

1. Login to admin panel
2. Click **"New Post"** in the sidebar
3. Fill in the form:
   - **Title**: Your post title (required)
   - **Date**: Select the publication date (required)
   - **Category**: Optional category (e.g., "Technology", "General")
   - **Content**: Use the rich text editor to write your post
4. Click **"Save Post"**
5. Your post is now saved!

### Editing a Blog Post

1. Go to **"All Posts"** section
2. Find the post you want to edit
3. Click the **Edit** button (pencil icon)
4. Make your changes
5. Click **"Save Post"**

### Deleting a Blog Post

1. Go to **"All Posts"** section
2. Find the post you want to delete
3. Click the **Delete** button (trash icon)
4. Confirm deletion

### Changing Your Password

1. Go to **"Settings"** section
2. Enter your current password
3. Enter your new password (minimum 6 characters)
4. Confirm your new password
5. Click **"Change Password"**

### Exporting Blog for Deployment

1. Go to **"Export Blog"** section
2. Click **"Download blog.json"**
3. The file will download to your computer
4. Upload this file to your server to update your live website

## 🚀 Deployment Workflow

### Option 1: Using Admin Panel (Recommended)
1. Create/edit posts in the admin panel
2. Export `blog.json` from the admin panel
3. Upload the exported `blog.json` to your server
4. Your website will automatically show the updated posts

### Option 2: Direct localStorage Sync
- Posts created in admin panel are stored in browser localStorage
- The main website checks localStorage first, then falls back to `blog.json`
- For visitors to see your posts, you need to export and upload `blog.json`

## 💡 Tips & Best Practices

1. **Regular Backups**: Export your blog.json regularly as a backup
2. **Rich Formatting**: Use headings, code blocks, and formatting to make your posts engaging
3. **Categories**: Use consistent categories to organize your posts
4. **Dates**: Set appropriate dates for your posts (they're sorted newest first)
5. **Security**: Keep your admin password strong and don't share it

## 🎨 Rich Text Editor Tips

- **Code Blocks**: Perfect for sharing code snippets
- **Headings**: Use H2 or H3 for section headers
- **Lists**: Great for step-by-step guides or feature lists
- **Links**: Add links to external resources
- **Images**: Upload images to enhance your posts
- **Blockquotes**: Use for quotes or important notes

## 🔧 Technical Details

- **Authentication**: SHA-256 password hashing
- **Storage**: Browser localStorage for admin panel
- **Editor**: Quill.js rich text editor
- **Session**: 8-hour timeout for security
- **Export**: JSON format compatible with your website

## ❓ Troubleshooting

### Can't login?
- Check if you're using the correct username/password
- Clear browser cache and try again
- Default credentials: admin / admin123

### Posts not showing on website?
- Make sure you've exported `blog.json` from admin panel
- Upload the exported file to your server
- Clear browser cache and refresh

### Editor not loading?
- Check your internet connection (Quill.js loads from CDN)
- Try refreshing the page

## 📞 Support

If you encounter any issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Make sure all files are uploaded correctly

---

**Enjoy managing your blog! 🎉**

