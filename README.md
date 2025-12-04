# Portfolio Website - Arun Jaiswal

A modern, responsive portfolio website with integrated blog management system.

## 📁 Project Structure

```
New-Portfolio/
├── index.html                 # Main portfolio website
├── CNAME                      # Custom domain configuration
│
├── admin/                     # Admin Panel
│   ├── admin-login.html      # Admin login page
│   ├── admin-dashboard.html  # Admin dashboard
│   ├── admin-auth.js         # Authentication logic
│   ├── admin-dashboard.js    # Dashboard functionality
│   └── admin-styles.css      # Admin panel styles
│
├── assets/                    # Static Assets
│   ├── css/
│   │   └── style.css         # Main website styles
│   ├── js/
│   │   └── script.js         # Main website JavaScript
│   └── images/               # Images and icons
│
├── data/                      # Data Files
│   └── blog.json             # Blog posts data
│
└── docs/                      # Documentation
    ├── ADMIN_PANEL_GUIDE.md
    ├── BLOG_WORKFLOW.md
    └── ...
```

## 🚀 Features

- **Portfolio Website**: Showcase your skills, experience, and services
- **Blog System**: Rich text editor for blog posts
- **Admin Panel**: Secure admin interface for managing blog posts
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean and professional design

## 🔐 Admin Panel Access

- **URL**: `https://arunjaiswal.com.np/admin/admin-login.html`
- **Default Credentials**: 
  - Username: `admin`
  - Password: `admin123`
- **⚠️ Important**: Change password after first login!

## 📝 Blog Management

1. Login to admin panel
2. Create/edit blog posts with rich text editor
3. Export `blog.json` from admin panel
4. Upload to `data/blog.json` in repository
5. Commit and push to GitHub
6. Posts will appear on website after 1-2 minutes

See `docs/BLOG_WORKFLOW.md` for detailed instructions.

## 🛠️ Development

### Local Development

```bash
# Start a local server
python -m http.server 3000

# Or using Node.js
npx http-server -p 3000
```

Then visit: `http://localhost:3000`

### File Organization

- **Root**: Main HTML files and configuration
- **admin/**: All admin panel related files
- **assets/**: CSS, JavaScript, and images
- **data/**: JSON data files (blog posts)
- **docs/**: Documentation files

## 📚 Documentation

- `docs/ADMIN_PANEL_GUIDE.md` - Complete admin panel guide
- `docs/BLOG_WORKFLOW.md` - Blog publishing workflow
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment steps

## 🌐 Deployment

This site is deployed on GitHub Pages at:
- **Custom Domain**: `https://arunjaiswal.com.np`
- **GitHub Pages**: `https://jaisarun53.github.io/New-Portfolio`

## 📄 License

All rights reserved © Arun Jaiswal

