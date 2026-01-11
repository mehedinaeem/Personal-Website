# Application Tracker - Deployment Guide

This guide covers deploying the Application Tracker backend on Render and frontend on Netlify.

## Backend Deployment (Render)

### Prerequisites
1. A [Render](https://render.com) account
2. A [Supabase](https://supabase.com) project with PostgreSQL database
3. Gmail account with App Password (or other SMTP provider)

### Supabase Setup
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **Settings > Database**
4. Copy the connection details:
   - **Host**: `db.xxxxxxxxxxxx.supabase.co`
   - **Database name**: `postgres`
   - **Port**: `5432`
   - **User**: `postgres`
   - **Password**: Your database password

### Render Deployment Steps

1. **Create Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" > "Web Service"
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```
   Root Directory: Backend/portfolio
   Runtime: Python 3
   Build Command: pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
   Start Command: gunicorn portfolio.wsgi:application
   ```

3. **Add Environment Variables**
   Add these in Render's Environment tab:
   ```
   SECRET_KEY=<generate-new-secret-key>
   DEBUG=False
   ALLOWED_HOSTS=<your-app-name>.onrender.com
   
   # Supabase
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=<your-supabase-password>
   SUPABASE_DB_HOST=db.xxxxxxxxxxxx.supabase.co
   SUPABASE_DB_PORT=5432
   
   # SMTP
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=<your-email>@gmail.com
   EMAIL_HOST_PASSWORD=<your-app-password>
   EMAIL_USE_TLS=True
   ADMIN_EMAIL=<your-email>@gmail.com
   
   # JWT
   JWT_SIGNING_KEY=<generate-new-jwt-key>
   
   # CORS
   CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
   ```

4. **Create Admin User**
   After deployment, use Render's Shell:
   ```bash
   python manage.py createsuperuser
   ```

### Cron Jobs on Render

Render offers [Cron Jobs](https://render.com/docs/cronjobs) for scheduled tasks.

1. Create a new **Cron Job** in Render
2. Configure:
   ```
   Command: python manage.py shell -c "from applications.cron import send_deadline_reminders; send_deadline_reminders()"
   Schedule: 0 8 * * * (Daily at 8 AM UTC)
   ```

3. Create another for result reminders:
   ```
   Command: python manage.py shell -c "from applications.cron import send_result_reminders; send_result_reminders()"
   Schedule: 0 9 * * * (Daily at 9 AM UTC)
   ```

---

## Frontend Deployment (Netlify)

Your frontend is already configured for Netlify deployment.

### Steps

1. **Update Environment Variables**
   - Go to Netlify > Site Settings > Environment Variables
   - Add:
     ```
     VITE_API_BASE_URL=https://your-render-app.onrender.com/api
     ```

2. **Deploy**
   - Push changes to your `main` branch
   - Netlify will auto-deploy

### Verify CORS

Make sure your Render backend's `CORS_ALLOWED_ORIGINS` includes your Netlify URL:
```
CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

---

## Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to **App Passwords** (search in settings)
4. Generate a new App Password for "Mail"
5. Use this 16-character password as `EMAIL_HOST_PASSWORD`

---

## Testing Locally

### Backend
```bash
cd Backend/portfolio
pip install -r requirements.txt
# Copy .env.example to .env and fill in values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

### Test Email Reminders Locally
```bash
python manage.py shell
>>> from applications.cron import send_deadline_reminders
>>> send_deadline_reminders()
```

---

## Environment Variables Summary

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | Set to `False` in production |
| `ALLOWED_HOSTS` | Your backend domain |
| `SUPABASE_DB_*` | Supabase PostgreSQL credentials |
| `EMAIL_*` | SMTP configuration |
| `ADMIN_EMAIL` | Email to receive reminders |
| `JWT_SIGNING_KEY` | JWT token signing key |
| `CORS_ALLOWED_ORIGINS` | Frontend URL(s) |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL |
