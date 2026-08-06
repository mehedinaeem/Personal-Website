# Production deployment runbook

This repository deploys the React app from `Frontend/` to Netlify and the Django app from `Backend/` to Heroku. Commands below use placeholders only. Never paste secrets into source files or commit a real `.env`.

## Cost and account preparation

1. Verify GitHub Student Developer Pack eligibility, open the Heroku student offer, apply using the same personal Heroku account, and add the required payment card.
2. In Heroku Account Settings → Billing, verify the student platform-credit allocation before provisioning resources. Check Current Usage throughout the month. Unused monthly credit does not roll over and usage beyond the monthly credit is billed.
3. Target one Eco web dyno ($5 shared 1,000-hour pool) and Mini Heroku Postgres ($5/month). Heroku Scheduler is a free add-on, but its short one-off dyno executions consume dyno hours. Expected base usage is approximately $10/month plus small Scheduler dyno-hour usage, under the requested $13 credit when no other apps consume the Eco pool.
4. Do not add Redis, Celery, a worker dyno, or third-party paid add-ons.

## Heroku backend deployment

The Python buildpack must see `requirements.txt`, `Procfile`, and `.python-version` at its deployment root. Because they live in `Backend/`, deploy that subtree. Fir does not currently support direct monorepo builds, so use a Cedar-generation app and subtree deployment rather than a third-party monorepo buildpack.

```bash
heroku login
heroku create <backend-app-name>
heroku stack:set heroku-24 -a <backend-app-name>
heroku addons:create heroku-postgresql:mini -a <backend-app-name>
heroku addons:create scheduler:standard -a <backend-app-name>
```

Heroku provisions `DATABASE_URL` automatically. If the plan catalog offered to your account uses a different current low-cost identifier, confirm its displayed monthly price before accepting it. Do not blindly provision a plan whose displayed price would exceed the budget.

Configure placeholders from a secure local terminal. The Heroku app hostname is included because it remains useful before custom DNS is live.

```bash
heroku config:set DJANGO_SETTINGS_MODULE=config.settings.production -a <backend-app-name>
heroku config:set DJANGO_SECRET_KEY="<secure-random-value>" -a <backend-app-name>
heroku config:set FRONTEND_URL="https://mehedinaeem.dev" -a <backend-app-name>
heroku config:set DJANGO_ALLOWED_HOSTS="api.mehedinaeem.dev,<backend-app-name>.herokuapp.com" -a <backend-app-name>
heroku config:set CORS_ALLOWED_ORIGINS="https://mehedinaeem.dev,https://www.mehedinaeem.dev" -a <backend-app-name>
heroku config:set CSRF_TRUSTED_ORIGINS="https://mehedinaeem.dev,https://www.mehedinaeem.dev,https://api.mehedinaeem.dev" -a <backend-app-name>
heroku config:set TELEGRAM_BOT_TOKEN="<token>" -a <backend-app-name>
heroku config:set TELEGRAM_CHAT_ID="<chat-id>" -a <backend-app-name>
heroku config:set TELEGRAM_WEBHOOK_SECRET="<strong-random-secret>" -a <backend-app-name>
```

Configure email variables only if email reminders are enabled:

```bash
heroku config:set DEFAULT_FROM_EMAIL="<sender>" EMAIL_HOST="<smtp-host>" EMAIL_PORT="587" EMAIL_HOST_USER="<smtp-user>" EMAIL_HOST_PASSWORD="<smtp-password>" EMAIL_USE_TLS="True" -a <backend-app-name>
```

Deploy only the backend subtree:

```bash
git remote add heroku https://git.heroku.com/<backend-app-name>.git
git subtree push --prefix Backend heroku main
```

If subtree push reports a non-fast-forward after a rollback or rebuilt branch, create a fresh split and push that generated commit deliberately; do not force-push the main GitHub branch.

The release process automatically runs migrations from `Procfile`. Verify and create the first administrator:

```bash
heroku run python manage.py check --deploy -a <backend-app-name>
heroku run python manage.py migrate -a <backend-app-name>
heroku run python manage.py createsuperuser -a <backend-app-name>
heroku ps:scale web=1 -a <backend-app-name>
```

### Custom API domain and HTTPS

```bash
heroku domains:add api.mehedinaeem.dev -a <backend-app-name>
heroku domains -a <backend-app-name>
heroku certs:auto:enable -a <backend-app-name>
heroku certs:auto -a <backend-app-name>
```

Copy the DNS target shown by `heroku domains` and create a CNAME for host `api` at the DNS provider. Do not point the CNAME directly at an app name guessed from this document. Wait for DNS propagation and confirm ACM reports an issued certificate before relying on the custom hostname.

### Telegram and Scheduler

```bash
heroku run python manage.py configure_telegram_webhook -a <backend-app-name>
heroku run python manage.py send_test_telegram -a <backend-app-name>
heroku run python manage.py dispatch_notifications -a <backend-app-name>
heroku addons:open scheduler -a <backend-app-name>
```

In Scheduler add `python manage.py dispatch_notifications`, select every 10 minutes, and use the same low-cost dyno size. Scheduler can occasionally miss or overlap executions; the dispatcher uses database claims, idempotent statuses, retries, and a delayed-run look-back window. It needs no worker process.

### Operations, rollback, and backups

```bash
heroku logs --tail -a <backend-app-name>
heroku ps -a <backend-app-name>
heroku restart -a <backend-app-name>
heroku releases -a <backend-app-name>
heroku rollback v<release-number> -a <backend-app-name>
heroku pg:info -a <backend-app-name>
heroku pg:backups:capture -a <backend-app-name>
heroku pg:backups -a <backend-app-name>
heroku pg:backups:download -a <backend-app-name>
```

Before restoring, capture a fresh backup and understand that restore overwrites the target database:

```bash
heroku pg:backups:restore <backup-url-or-id> DATABASE_URL -a <backend-app-name>
```

Review Billing → Current Usage at least weekly. Scheduler runs appear as one-off dyno usage. Scale only `web=1`; verify no `worker` or Redis resource exists.

## Netlify frontend deployment

Create a Netlify site from the GitHub repository with:

- Base directory: `Frontend`
- Build command: `npm run build`
- Publish directory: `dist` (relative to the base directory)
- Production environment variable: `VITE_API_BASE_URL=https://api.mehedinaeem.dev/api/v1`

Do not add Django, database, Telegram, SMTP, refresh-token, or other secrets to `VITE_*`. Vite values are public browser-bundle configuration.

`Frontend/netlify.toml` and `Frontend/public/_redirects` both provide `/* /index.html 200`, so direct refreshes on nested public and protected React routes return the SPA. Hashed `/assets/` files use immutable caching; `index.html` remains the SPA entry point.

Add `mehedinaeem.dev` and `www.mehedinaeem.dev` under Domain Management. Configure the exact DNS records Netlify displays, set the preferred primary domain, wait for Netlify HTTPS issuance, and enable forced HTTPS only after the certificate is active.

Axios sends credential-enabled refresh/logout requests and attaches the in-memory access token. Confirm the backend CORS allowlist exactly matches both production frontend origins.

## Telegram bot setup

1. Create the bot with BotFather and store its token only in Heroku config.
2. Set the numeric private chat ID and a strong webhook secret in Heroku config.
3. Deploy the backend and wait for `https://api.mehedinaeem.dev/api/v1/telegram/webhook/` to work over HTTPS.
4. Run `configure_telegram_webhook`, followed by `send_test_telegram`.
5. Test `/start`, `/help`, `/today`, `/goals`, `/deadlines`, `/travel`, and `/save <public-url>` from the authorized chat.

## API inventory

- Health: `/api/v1/health/`
- Authentication: `/api/v1/auth/login/`, `refresh/`, `logout/`, `me/`
- Tasks: `/api/v1/tasks/`, task detail, `today/`, `upcoming/`, `overdue/`, `complete/`, and nested logs
- Daily reviews: `/api/v1/daily-reviews/` and date detail
- Goals: `/api/v1/goals/`, period lists, progress update, and complete
- Progress: `/api/v1/progress/summary/`, `analytics/`, `analytics/export/`, reviews, and activities
- Learning: `/api/v1/learning/items/` and nested sessions
- Travel: `/api/v1/travel/plans/`, nested itinerary, and checklist
- Opportunities: `/api/v1/opportunities/`, `upcoming/`, `expired/`, and `mark-applied/`
- Applications: `/api/v1/applications/`
- Capture: `/api/v1/capture/extract/` and captured-link detail
- Telegram: `/api/v1/telegram/webhook/`
- Reminders: `/api/v1/reminders/` and cancel action
- Dashboard: `/api/v1/dashboard/summary/`
- Portfolio/contact APIs: `/api/v1/portfolio/` and `/api/v1/contacts/`

All non-health application APIs are private unless an individual public portfolio/contact view explicitly declares otherwise.

## Data model summary

The production database contains Django users and JWT blacklist records; tasks, progress logs and daily reviews; goals, progress reviews and activity logs; learning items and sessions; travel plans, itinerary and checklist items; opportunities and applications; captured links; reminders; and existing portfolio/contact content. Private productivity records use an `owner` relationship and owner-filtered querysets.

## Production verification checklist

- [ ] Student benefit is active and current monthly credit/usage is visible.
- [ ] Exactly one low-cost web dyno and one low-cost Postgres database are provisioned.
- [ ] No Redis, Celery, worker dyno, or paid third-party add-on exists.
- [ ] Release migration succeeds and Postgres is used; no production SQLite database exists.
- [ ] `/api/v1/health/` returns HTTP 200 over HTTPS.
- [ ] Django admin and private React admin login work with the production superuser.
- [ ] Access-token refresh rotates the cookie; logout invalidates it.
- [ ] Refresh cookie is Secure, HttpOnly, scoped to `/api/v1/auth/`, and absent from browser storage.
- [ ] Task creation, editing, completion, deletion, progress logs, and daily review work.
- [ ] Daily, monthly, and yearly goals and progress reviews work.
- [ ] Activity logging, learning items, and learning sessions work.
- [ ] Travel plan, itinerary, checklist, timeline, and optional defaults work.
- [ ] Opportunity creation, application stages, follow-up, and owner isolation work.
- [ ] Public-link extraction works; Facebook and LinkedIn restricted pages fall back to manual review.
- [ ] Telegram captures a link only from the configured chat and returns the review URL.
- [ ] Telegram test notification succeeds without secrets appearing in logs.
- [ ] Confirmed opportunity deadlines generate only future default reminders.
- [ ] Scheduler dispatch runs every ten minutes and logs a successful exit.
- [ ] Daily analytics, monthly charts, yearly charts, heatmap, learning analytics, travel timeline, and CSV export work with zero and nonzero data.
- [ ] CSV cells beginning with formula characters are escaped.
- [ ] Postgres data persists across deploys and dyno restarts.
- [ ] Direct Netlify refresh works for `/admin`, dashboard, task, goal, progress, learning, travel, opportunity, application, and capture routes.
- [ ] Static JS/CSS assets load with successful responses and correct MIME types.
- [ ] Only the two frontend domains pass CORS; credentialed refresh requests succeed.
- [ ] CSRF protection rejects missing/untrusted origins and accepts the configured production origins.
- [ ] Both domains redirect to HTTPS and certificates are valid.
- [ ] Logs contain operational metadata but no passwords, JWTs, Telegram secrets, database URL, or SMTP password.
- [ ] `git ls-files` shows no real `.env`, virtual environment, SQLite database, staticfiles, media, or `__pycache__` content.
- [ ] A Postgres backup is captured, listed, downloaded, and restoration steps are understood.
- [ ] Billing/current usage remains below the monthly student-credit limit.

## Pre-deployment commands

```bash
cd Backend
python manage.py check --deploy
python manage.py test

cd ../Frontend
npm run lint
npm run build
```
