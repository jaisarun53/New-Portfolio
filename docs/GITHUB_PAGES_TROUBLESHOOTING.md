# GitHub Pages 404 Troubleshooting Guide

## 🔍 Common Issues and Solutions

### Issue: Getting 404 Error on Admin Panel

**Possible Causes:**

1. **Files Not Committed/Pushed to GitHub**
   - Make sure all admin files are committed and pushed to your repository
   - Check: `admin-login.html`, `admin-dashboard.html`, `admin-auth.js`, `admin-dashboard.js`, `admin-styles.css`

2. **Wrong URL**
   - Correct URL: `https://arunjaiswal.com.np/admin-login.html`
   - Or: `https://www.arunjaiswal.com.np/admin-login.html`
   - Make sure you're using the exact filename (case-sensitive)

3. **GitHub Pages Not Enabled**
   - Go to your repository Settings → Pages
   - Make sure GitHub Pages is enabled
   - Select the correct branch (usually `main` or `master`)

4. **Case Sensitivity**
   - GitHub Pages is case-sensitive
   - Use exactly: `admin-login.html` (not `Admin-Login.html`)

## ✅ Step-by-Step Fix

### Step 1: Verify Files Are Committed
```bash
git status
git add admin-login.html admin-dashboard.html admin-auth.js admin-dashboard.js admin-styles.css
git commit -m "Add admin panel files"
git push
```

### Step 2: Check GitHub Pages Settings
1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Source: Select your branch (main/master)
4. Folder: `/ (root)`
5. Click **Save**

### Step 3: Wait for Deployment
- GitHub Pages can take 1-5 minutes to update
- Check the Actions tab for deployment status

### Step 4: Clear Browser Cache
- Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
- Or try incognito/private mode

### Step 5: Test the URLs
Try these URLs in order:
1. `https://arunjaiswal.com.np/admin-login.html`
2. `https://www.arunjaiswal.com.np/admin-login.html`
3. `https://[your-username].github.io/[repo-name]/admin-login.html`

## 🔧 Quick Test

Create a simple test file to verify GitHub Pages is working:

1. Create `test.html` with content: `<h1>Test</h1>`
2. Commit and push
3. Access: `https://arunjaiswal.com.np/test.html`
4. If this works, GitHub Pages is configured correctly

## 📝 Verify File Structure

Your repository should have these files in the root:
```
/
├── index.html
├── admin-login.html          ← Must exist
├── admin-dashboard.html      ← Must exist
├── admin-auth.js            ← Must exist
├── admin-dashboard.js        ← Must exist
├── admin-styles.css          ← Must exist
├── blog.json
├── script.js
├── style.css
└── images/
```

## 🚨 Still Not Working?

1. **Check Repository Settings**
   - Make sure repository is public (or you have GitHub Pro)
   - Verify custom domain is configured correctly in CNAME

2. **Check File Permissions**
   - All files should be readable
   - No special characters in filenames

3. **Check GitHub Actions**
   - Go to Actions tab
   - Look for any failed deployments
   - Check error messages

4. **Try Direct GitHub URL**
   - `https://raw.githubusercontent.com/[username]/[repo]/main/admin-login.html`
   - If this works, the file exists but Pages might not be serving it

## 💡 Alternative: Use GitHub.io URL

If custom domain isn't working, try:
- `https://[your-username].github.io/[repo-name]/admin-login.html`

Then update your CNAME file if needed.

---

**Need more help?** Check GitHub Pages documentation or repository issues.

