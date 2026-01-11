# Render Deployment Guide

Deploy your Django Portfolio backend to Render.com with this guide.

## Quick Deploy

### Option 1: Blueprint (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your GitHub repository
5. Render will detect `render.yaml` and create:
   - **Web Service** (Django API)
   - **Cron Job** (Daily reminders at 8 AM UTC)

### Option 2: Manual Setup

#### Create Web Service
1. **New** → **Web Service**
2. Connect GitHub repo
3. Configure:
   - **Name:** `portfolio-api`
   - **Root Directory:** `Backend/portfolio`
   - **Runtime:** Python 3
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `gunicorn portfolio.wsgi:application --bind 0.0.0.0:$PORT`

#### Create Cron Job
1. **New** → **Cron Job**
2. Configure:
   - **Name:** `send-reminders`
   - **Root Directory:** `Backend/portfolio`
   - **Schedule:** `0 8 * * *` (8 AM UTC = 2 PM Bangladesh)
   - **Command:** `python manage.py send_reminders`

---

## Environment Variables

Set these in Render Dashboard → **Environment**:

### Required Variables

```env
# Django
ALLOWED_HOSTS=your-app.onrender.com
DEBUG=False

# Frontend URL (for CORS)
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app

# Supabase Database
SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-password

# Email (Gmail SMTP)
EMAIL_HOST_USER=mehedinaeem00@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=mehedinaeem00@gmail.com
```

### Auto-Generated (by render.yaml)
- `SECRET_KEY` - Django secret key
- `JWT_SIGNING_KEY` - JWT token signing key

---

## Files Created for Deployment

| File | Purpose |
|------|---------|
| `render.yaml` | Render blueprint configuration |
| `build.sh` | Build script (install deps, migrate, collectstatic) |
| `runtime.txt` | Python version (3.11.0) |
| `requirements.txt` | Python dependencies |
| `applications/management/commands/send_reminders.py` | Cron job command |

---

## Verify Deployment

After deployment:

1. **Check Web Service:** Visit `https://your-app.onrender.com/admin/`
2. **Check Logs:** Render Dashboard → Logs
3. **Test Email:** Trigger a reminder manually:
   ```bash
   # In Render Shell
   python manage.py send_reminders
   ```

---

## Troubleshooting

### Build Fails
- Check `requirements.txt` has all dependencies
- Verify Python version in `runtime.txt`

### Database Connection Fails
- Verify Supabase credentials
- Check `SUPABASE_DB_*` env vars are set
- Ensure SSL is enabled (sslmode=require)

### Emails Not Sending
- Verify Gmail App Password (not regular password)
- Check `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`
- Enable "Less secure app access" or use App Password

### CORS Errors
- Add frontend URL to `CORS_ALLOWED_ORIGINS`
- Include `https://` prefix
