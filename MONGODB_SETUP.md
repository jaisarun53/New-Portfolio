# Your MongoDB Connection String Setup

## Your Connection String

You provided:
```
mongodb+srv://jaisarun53_db_user:<db_password>@cluster0.nixyi1e.mongodb.net/?appName=Cluster0
```

## ⚠️ Important: Replace Password

You need to replace `<db_password>` with your actual MongoDB password.

**Format it like this:**
```
mongodb+srv://jaisarun53_db_user:YOUR_ACTUAL_PASSWORD@cluster0.nixyi1e.mongodb.net/portfolio-blog?retryWrites=true&w=majority
```

### Changes Made:
1. ✅ Replace `<db_password>` with your actual password
2. ✅ Added `/portfolio-blog` (database name) before the `?`
3. ✅ Changed query parameters to `retryWrites=true&w=majority`

## Example (with fake password):
```
mongodb+srv://jaisarun53_db_user:MySecurePass123@cluster0.nixyi1e.mongodb.net/portfolio-blog?retryWrites=true&w=majority
```

## Next Steps:

### 1. Get Your Password
- Go to MongoDB Atlas → Database Access
- Find user: `jaisarun53_db_user`
- If you forgot the password, click "Edit" → "Reset Password"
- Copy the new password

### 2. Format Your Connection String
Replace `YOUR_ACTUAL_PASSWORD` in the format above with your real password.

### 3. Use in Railway
When deploying to Railway:
- Variable Name: `MONGODB_URI`
- Variable Value: (paste your formatted connection string)

### 4. Test Connection
After deploying, test at:
`https://your-railway-app.railway.app/api/health`

---

## 🔒 Security Note
- Never share your connection string publicly
- Never commit it to Git
- Only use it in Railway environment variables


