# Complete Render Deployment Guide
## Django + Supabase + Cloudinary

---

## 🚀 Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Note your project credentials:
   - **Dashboard** → **Settings** → **Database**
   - Copy: Host, Database name, User, Password, Port

```
Host: db.xxxxxxxxxxxx.supabase.co
Database: postgres
User: postgres
Password: your-password
Port: 5432
```

---

## 📷 Step 2: Set Up Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → **Sign Up Free**
2. Go to **Dashboard** and copy:

```
Cloud Name: your-cloud-name
API Key: 123456789012345
API Secret: abcdefghijklmnopqrstuvwxyz
```

---

## 📧 Step 3: Gmail App Password

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. **Security** → Enable **2-Factor Authentication**
3. **Security** → **App Passwords** → Generate for "Mail"
4. Copy the 16-character password

---

## 🖥️ Step 4: Deploy to Render

### Option A: Blueprint (Automatic)

1. **Push code to GitHub**
2. Go to [dashboard.render.com](https://dashboard.render.com)
3. **New** → **Blueprint**
4. Connect your GitHub repo
5. Render detects `render.yaml` and creates:
   - ✅ Web Service
   - ✅ Cron Job (daily at 8 AM UTC)

### Option B: Manual Setup

1. **New** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - **Name:** `portfolio-api`
   - **Root Directory:** `Backend/portfolio`
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `gunicorn portfolio.wsgi:application --bind 0.0.0.0:$PORT`

---

## 🔐 Step 5: Set Environment Variables

In Render Dashboard → **Environment** → Add these:

### Django
```
ALLOWED_HOSTS=your-app.onrender.com
DEBUG=False
```

### Supabase Database
```
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password
SUPABASE_DB_PORT=5432
```

### Cloudinary
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret
```

### Email (Gmail SMTP)
```
EMAIL_HOST_USER=mehedinaeem00@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=mehedinaeem00@gmail.com
```

### CORS (Frontend URL)
```
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
```

---

## ⏰ Step 6: Set Up Cron Job

If using manual setup (not Blueprint):

1. **New** → **Cron Job**
2. Settings:
   - **Name:** `send-reminders`
   - **Root Directory:** `Backend/portfolio`
   - **Schedule:** `0 8 * * *` (8 AM UTC = 2 PM Bangladesh)
   - **Command:** `python manage.py send_reminders`
3. Add same environment variables as web service

---

## ✅ Step 7: Verify Deployment

1. **Check Web Service:** `https://your-app.onrender.com/admin/`
2. **Check Logs:** Dashboard → Logs tab
3. **Test API:** `https://your-app.onrender.com/api/applications/`

---

## 📁 Files for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render blueprint |
| `build.sh` | Build script |
| `runtime.txt` | Python 3.11.0 |
| `requirements.txt` | Dependencies |
| `.gitignore` | Protects `.env` |

---

## ❓ Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check `requirements.txt` and Python version |
| DB connection fails | Verify Supabase credentials, ensure SSL |
| CORS errors | Add frontend URL with `https://` |
| Media files not uploading | Check Cloudinary credentials |
| Emails not sending | Use Gmail App Password, not regular password |
