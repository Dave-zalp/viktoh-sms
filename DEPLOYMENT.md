# Viktohs SMS — Deployment & Handover Guide

Everything a new developer needs to run this project locally and deploy it to shared
hosting (the live setup is Hostinger shared hosting + SSH).

---

## 1. What this project is

Two independent applications in one repository:

| Folder | Stack | Deployed to | Purpose |
|---|---|---|---|
| `viktoh_sms_back/` | Laravel 12, PHP 8.2+, MySQL | `app.viktohs-sms.com` (API subdomain) | REST API, auth, wallet, SMS providers, payment webhooks |
| `Viktohsms_front/` | React 18 + Vite 6 + Tailwind 4 (TypeScript) | `viktohssms.com` (main domain) | Single-page app (landing, user dashboard, admin) |

They are **fully decoupled**: the SPA is a static bundle that talks to the API over
HTTPS with a Sanctum bearer token stored in `localStorage`. There is no session/cookie
sharing between the two domains, so they can live on different hosts if needed.

```
Browser --> viktohssms.com (static dist/)  --fetch-->  app.viktohs-sms.com/api/... (Laravel)
                                                              |
                                  +---------------------------+---------------------------+
                                  v                           v                           v
                          GrizzlySMS / DaisySMS         KoraPay (cards)         PocketFi / PaymentPoint
                          (buy virtual numbers)         (wallet top-up)         (virtual accounts, webhooks)
```

### Key third-party services (accounts must be transferred at handover)

| Service | Used for | Config file | Env prefix |
|---|---|---|---|
| GrizzlySMS | Buying virtual numbers (server 3, the active one) | `config/grizzly-sms.php` | `GRIZZLY_SMS_*` |
| DaisySMS | Alternate number provider | `config/services.php` (`daisysms`) | `DAISY_*` |
| SMS-Activate | Legacy number provider | `config/sms-activate.php` | `SMS_ACTIVATE_*` |
| KoraPay | Card/bank checkout for wallet funding | `config/korapay.php` | `KORAPAY_*` |
| PocketFi | Dedicated virtual accounts | `config/pocketfi.php` | `POCKETFI_*` |
| PaymentPoint | Legacy virtual accounts | `config/paymentpoint.php` | `PAYMENTPOINT_*` |
| SMTP mailbox | Verification + password-reset emails | `config/mail.php` | `MAIL_*` |

---

## 2. Handover checklist (do this first)

Get the outgoing developer to hand over, in writing:

- [ ] Hosting control panel login (Hostinger hPanel) + SSH user / host / port
- [ ] Domain registrar / DNS access for `viktohssms.com` and `app.viktohs-sms.com`
- [ ] The **production `.env`** from the server (it is *not* in git — see §4). Copy it off
      the server before doing anything else; it is the only copy of the production secrets.
- [ ] MySQL database name, user, password, and a fresh `mysqldump` backup
- [ ] Dashboard logins for: GrizzlySMS, DaisySMS, SMS-Activate, KoraPay, PocketFi, PaymentPoint
- [ ] The SMTP mailbox credentials used for transactional email
- [ ] GitHub repository ownership plus the Actions secrets listed in §6
- [ ] At least one **admin** account for the app (`users.role = 'admin'`)

---

## 3. Local development setup

### Requirements

- PHP **8.2+** with `mbstring, bcmath, curl, xml, ctype, json, tokenizer, pdo_mysql`
- Composer 2
- MySQL 5.7+ / MariaDB
- Node.js 20 + pnpm 9 (the frontend lockfile is `pnpm-lock.yaml`)

XAMPP on Windows works fine — this repo currently lives at `C:\xampp\htdocs\ViktohSms`.

### Backend

```bash
cd viktoh_sms_back
composer install
cp .env.example .env
php artisan key:generate
# create an empty MySQL database, then set DB_* in .env
php artisan migrate
php artisan serve              # http://127.0.0.1:8000
```

`composer setup` runs install + key + migrate in one go if you prefer.

Notes for local work:

- `MAIL_MAILER=log` in `.env.example` — verification/reset emails land in
  `storage/logs/laravel.log` instead of being sent. Good enough for development.
- Mailables (`app/Mail/*`) implement `ShouldQueue` and `QUEUE_CONNECTION=database`, so
  **nothing is emailed until a queue worker runs**. Locally, run `php artisan queue:work`
  in a second terminal (or `composer dev`, which starts serve + queue + vite together).

### Frontend

```bash
cd Viktohsms_front
pnpm install
pnpm run dev                   # http://localhost:5173
```

> **Important:** the API base URL is **hardcoded**, not read from an env var.
> To point the SPA at a local API, edit line 3 of `src/app/utils/api.ts`:
>
> ```ts
> const API_BASE_URL = 'https://app.viktohs-sms.com/api';   // -> 'http://127.0.0.1:8000/api'
> ```
>
> Do not commit that change. See §9 for the recommended fix.

---

## 4. Production environment file

`.env` is git-ignored. Create it directly on the server (never commit it). Template:

```dotenv
APP_NAME="Viktohs SMS"
APP_ENV=production
APP_KEY=                            # php artisan key:generate (or copy the existing one)
APP_DEBUG=false                     # MUST be false in production
APP_URL=https://app.viktohs-sms.com
FRONT_URL=https://viktohssms.com    # used to build email verification / reset links

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_MAINTENANCE_DRIVER=file
BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
BROADCAST_CONNECTION=log

# --- Transactional email (shared hosting SMTP) ---
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_SCHEME=smtps
MAIL_USERNAME=no-reply@viktohssms.com
MAIL_PASSWORD=
MAIL_FROM_ADDRESS="no-reply@viktohssms.com"
MAIL_FROM_NAME="${APP_NAME}"

# --- SMS number providers ---
GRIZZLY_SMS_API_KEY=
GRIZZLY_SMS_API_URL=https://api.grizzlysms.com/stubs/handler_api.php
GRIZZLY_SMS_DEFAULT_COUNTRY=187
GRIZZLY_SMS_TIMEOUT=30
GRIZZLY_SMS_ACTIVATION_TIMEOUT=1200

DAISY_API_KEY=
DAISY_MARKUP_PERCENT=
DAISY_EXCHANGE_RATE=

SMS_ACTIVATE_API_KEY=
SMS_ACTIVATE_API_URL=
SMS_ACTIVATE_DEFAULT_COUNTRY=187

# --- Payments ---
KORAPAY_PUBLIC_KEY=
KORAPAY_SECRET_KEY=

POCKETFI_API_URL=https://pocketfi.ng/api/v1
POCKETFI_API_TOKEN=
POCKETFI_BUSINESS_ID=
POCKETFI_BANK=paga
POCKETFI_WEBHOOK_SECRET=
POCKETFI_TIMEOUT=30

PAYMENTPOINT_API_URL=
PAYMENTPOINT_API_KEY=
PAYMENTPOINT_API_SECRET=
PAYMENTPOINT_BUSINESS_ID=
```

`.env.example` in the repo is behind the code — it is missing `FRONT_URL`, `DAISY_*`,
`SMS_ACTIVATE_*` and `PAYMENTPOINT_*`. Use the template above, not `.env.example`.

Rules:

- **Never** change `APP_KEY` on a live install — existing encrypted values and password
  reset tokens become unreadable.
- `APP_DEBUG=true` in production leaks env values and stack traces on every error. Keep it off.

---

## 5. Shared hosting deployment (manual, first time)

Assumes Hostinger-style shared hosting: one main domain + one subdomain, SSH available.

### 5.1 Create the two web roots in hPanel

| Site | Domain | Document root |
|---|---|---|
| Frontend | `viktohssms.com` | `~/domains/viktohssms.com/public_html` |
| API | `app.viktohs-sms.com` | `~/domains/app.viktohs-sms.com/public_html` |

Set PHP to **8.2 or 8.3** for the subdomain and enable `mbstring, bcmath, curl, xml,
ctype, json, tokenizer, pdo_mysql, openssl, fileinfo`. Issue free Let's Encrypt SSL for
both hosts — the SPA calls the API over HTTPS and mixed content will be blocked.

### 5.2 Lay out the Laravel app safely

Shared hosting serves whatever sits in `public_html`. Laravel must expose **only** its
`public/` directory, otherwise `.env`, `storage/` and `vendor/` are downloadable.

Recommended layout:

```
~/domains/app.viktohs-sms.com/
├── app/            <- the Laravel project (everything except public/)
│   ├── app/ bootstrap/ config/ database/ resources/ routes/ storage/ vendor/
│   ├── artisan
│   └── .env
└── public_html/    <- Laravel's public/ contents (document root)
    ├── index.php
    ├── .htaccess
    └── favicon.ico   robots.txt
```

Then edit `public_html/index.php` so the two `require` paths point one level up:

```php
require __DIR__.'/../app/vendor/autoload.php';
$app = require_once __DIR__.'/../app/bootstrap/app.php';
```

If your host lets you set the document root to an arbitrary path, the cleaner option is
to upload the whole project to `~/domains/app.viktohs-sms.com/app/` and point the
document root at `app/public` — then `index.php` needs no edit.

> The existing GitHub Action (§6) uploads the *whole* backend to
> `VIKTOHSMS_BACKEND_DEPLOY_PATH`. Whatever layout you choose, make sure that secret
> points at the private folder (`.../app`), **not** at `public_html`.

### 5.3 Upload and install the backend

Over SSH (fastest) or SFTP:

```bash
cd ~/domains/app.viktohs-sms.com/app
# upload the repo's viktoh_sms_back/ contents here (exclude .git, node_modules, tests)

composer install --no-dev --optimize-autoloader   # or upload vendor/ if composer is unavailable
nano .env                                          # paste the §4 template and fill it in
php artisan key:generate                           # only for a brand-new install

mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache
mkdir -p storage/logs bootstrap/cache
chmod -R 775 storage bootstrap/cache

php artisan migrate --force
php artisan db:seed --force        # first install only — seeds DaisySMS services
php artisan optimize:clear
php artisan config:cache
```

Do **not** run `php artisan route:cache` — `routes/web.php` uses a route closure and
caching will fail. (The existing workflow deliberately skips it.)

Verify: `https://app.viktohs-sms.com/up` returns Laravel's health page, and
`https://app.viktohs-sms.com/api/services/countries` returns JSON.

### 5.4 Cron jobs (required)

Shared hosting has no daemon, so queued email is processed by cron. In hPanel ->
Advanced -> Cron Jobs, add:

```
# every 5 minutes — drains queued verification / password-reset emails
*/5 * * * * cd ~/domains/app.viktohs-sms.com/app && /usr/bin/php artisan queue:work --stop-when-empty --tries=3 --max-time=240 >> storage/logs/queue.log 2>&1
```

Use `--stop-when-empty` (not a long-running `queue:work`); shared hosts kill long
processes and often forbid them outright. Confirm the PHP binary path with `which php` —
on Hostinger it is frequently `/usr/bin/php8.2` rather than `/usr/bin/php`.

Optional housekeeping:

```
0 3 * * * cd ~/domains/app.viktohs-sms.com/app && /usr/bin/php artisan queue:prune-failed --hours=168 >/dev/null 2>&1
```

There is no console schedule defined, so `schedule:run` is not needed today.
`app/Http/Controllers/CronController.php` exists but its only method (auto-refunding
stale DaisySMS orders) is commented out and unrouted — see §9.

### 5.5 Build and upload the frontend

```bash
cd Viktohsms_front
pnpm install
pnpm run build          # outputs to dist/
```

Upload the **contents** of `dist/` into `~/domains/viktohssms.com/public_html`
(so `public_html/index.html`, not `public_html/dist/index.html`).

`Viktohsms_front/public/.htaccess` is copied into `dist/` by the build and is what makes
deep links work — without it, refreshing `/dashboard` returns 404 because no such file
exists on disk:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
```

Confirm it survives every upload — a sync tool that skips dotfiles will silently
reintroduce the 404-on-refresh bug.

### 5.6 Register webhook URLs with the providers

In each provider's dashboard, point the callback at:

| Provider | Webhook URL |
|---|---|
| KoraPay | `https://app.viktohs-sms.com/api/webhook/korapay` |
| PocketFi | `https://app.viktohs-sms.com/api/webhook/pocketfi` |
| PaymentPoint | `https://app.viktohs-sms.com/api/webhook/paymentpoint` |
| DaisySMS | `https://app.viktohs-sms.com/api/webhook/daisysms` |
| SMS-Activate | `https://app.viktohs-sms.com/api/webhook/sms-activate` |

All five verify an HMAC signature against the matching `*_WEBHOOK_SECRET` / API secret in
`.env`. If wallets stop crediting after a deploy, check `storage/logs/laravel.log` for
`invalid signature` — it almost always means the secret in `.env` and the one in the
provider dashboard drifted apart.

The KoraPay notification URL is **also hardcoded in the frontend** at
`Viktohsms_front/src/app/pages/FundWalletPage.tsx:21`. If the API domain ever changes,
that line must change with it.

---

## 6. Automated deployment (GitHub Actions)

`.github/workflows/main.yml` already deploys **both** apps on every push to `main`:

1. **Backend job** — installs PHP 8.2 + `composer install --no-dev`, strips
   `.git/.github/tests/node_modules/.env`, SFTPs the result to the server, then over SSH
   runs `migrate`, `optimize:clear`, `config:clear`, and `chmod -R 775 storage bootstrap/cache`.
2. **Frontend job** — Node 20 + pnpm 9, `pnpm run build`, SFTPs `dist/*` to the frontend root.

Required repository secrets (Settings -> Secrets and variables -> Actions):

| Secret | Value |
|---|---|
| `VIKTOHSMS_SSH_HOST` | server hostname or IP |
| `VIKTOHSMS_SSH_USER` | SSH username |
| `VIKTOHSMS_SSH_PORT` | SSH port (Hostinger commonly 65002) |
| `VIKTOHSMS_SSH_KEY` | **private** key whose public half is in the server's `~/.ssh/authorized_keys` |
| `VIKTOHSMS_BACKEND_DEPLOY_PATH` | absolute path to the Laravel folder (the private one, not `public_html`) |
| `VIKTOHSMS_FRONTEND_DEPLOY_PATH` | absolute path to the frontend `public_html` |

Things to know before you rely on it:

- The deploy **does not upload `.env`** (it is deleted before transfer) — the server's
  existing `.env` is preserved. That is intentional. It also means a brand-new server
  must have `.env` created by hand first (§5.3).
- It **does not upload `vendor/`** (also deleted before transfer) and does not run
  `composer install` on the server. On a host where `vendor/` is already present this is
  fine, but **after changing `composer.json` you must SSH in and run
  `composer install --no-dev --optimize-autoloader` yourself**, or the deploy will run
  against stale dependencies.
- It runs `php artisan migrate` without `--force`; on some hosts the non-interactive
  shell answers "no" and the migration is skipped silently. Check the job log, or change
  it to `migrate --force`.
- It runs `config:clear` but not `config:cache`, so config is re-read per request
  (slightly slower, but safe).

---

## 7. Post-deploy verification

```bash
curl -i https://app.viktohs-sms.com/up                          # 200
curl -s https://app.viktohs-sms.com/api/services/countries      # JSON, not HTML
curl -i https://app.viktohs-sms.com/.env                        # MUST be 403/404
```

In the browser:

1. `https://viktohssms.com` loads the landing page.
2. Register a new account -> the verification email arrives (proves SMTP **and** the
   queue cron are working) and its link points at `FRONT_URL`.
3. Sign in, hard-refresh `/dashboard` -> still loads (SPA fallback `.htaccess` is intact).
4. Fund the wallet with a small real amount -> balance updates (proves the webhook).
5. Buy one number on server 3 (Grizzly) -> number is issued and the OTP arrives.

### Creating an admin

`users.role` drives `AdminMiddleware`, which gates every `/api/admin/*` route. Register
the account through the UI, then promote it:

```sql
UPDATE users SET role = 'admin' WHERE email = 'someone@example.com';
```

or via tinker:

```bash
php artisan tinker
>>> App\Models\User::where('email','someone@example.com')->update(['role' => 'admin']);
```

Admins get the `/admin` area in the SPA: user list, manual balance top-ups, transactions,
orders, and exchange-rate/top-up settings (`servicesettings_models` — a single row,
created on first read by the `service_settings()` helper and cached for an hour, so run
`php artisan cache:clear` if a rate change doesn't take effect).

---

## 8. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| 500 on every API route, blank page | `storage/` or `bootstrap/cache` not writable -> `chmod -R 775 storage bootstrap/cache`. Then read `storage/logs/laravel.log`. |
| 404 on `/dashboard` after refresh | SPA `.htaccess` missing from the frontend root — re-upload it (§5.5). |
| 404 on every API route | Document root points at the Laravel root instead of `public/`, or `mod_rewrite` is off. |
| `.env` downloadable in a browser | Document root is wrong — the project root is exposed. Fix immediately, then rotate every secret. |
| Config changes have no effect | Stale cache -> `php artisan config:clear && php artisan optimize:clear`. |
| Verification / reset emails never arrive | No queue worker. Check the cron in §5.4 and the `jobs` / `failed_jobs` tables. |
| Email links point to the wrong site | `FRONT_URL` unset — it defaults to `https://viktohs-sms.com` (`config/app.php:57`). |
| Wallet not credited after payment | Webhook signature mismatch or wrong URL in the provider dashboard — grep the log for `invalid signature`. |
| CORS errors in the browser console | Laravel's default CORS covers `api/*` only; requests must go to `/api/...` over HTTPS. Publish `config/cors.php` if you need to restrict origins. |
| `route:cache` fails | Expected — `routes/web.php` contains a closure. Don't cache routes. |

Logs: `storage/logs/laravel.log` (rotate or truncate periodically — shared hosting disk
quotas are small).

---

## 9. Known gaps to hand over

Honest state of the codebase, so the next developer isn't surprised:

1. **The API base URL is hardcoded** (`src/app/utils/api.ts:3`), as is the KoraPay
   notification URL (`src/app/pages/FundWalletPage.tsx:21`) and several marketing links
   (`viktohssms.com`, `smslegit.com`, `viktohsstore.com`). Moving these to
   `import.meta.env.VITE_API_BASE_URL` with a `.env.production` is the single
   highest-value cleanup — right now staging and production cannot be built from the
   same source.
2. **`.env.example` is stale** — missing `FRONT_URL`, `DAISY_*`, `SMS_ACTIVATE_*`,
   `PAYMENTPOINT_*`. Use §4 as the source of truth, and consider updating the file.
3. **The CI deploy never runs `composer install` on the server**, and strips `vendor/`
   before upload. Dependency changes require a manual SSH step (§6).
4. **No automated tests run in CI.** Pest is installed (`composer test`) but `tests/` is
   stripped during deploy and no workflow runs it.
5. **`CronController` is dead code** — the DaisySMS stale-order refund logic is commented
   out and has no route. Stale `purchased_numbers` rows are not auto-refunded today.
6. **Two number providers are dormant.** Only Grizzly (server 3) is routed in the SPA;
   DaisySMS and SMS-Activate endpoints still exist server-side. `viktoh_sms_back/TODO.md`
   lists the outstanding cleanups from the original author.
7. **Domain naming is inconsistent** across the codebase — `viktohssms.com`,
   `viktohs-sms.com` and `smslegit.com` all appear. Confirm which are live before
   changing anything.
8. **The frontend has no linter, formatter, or type-check step** — `pnpm run build` is
   the only gate, and `vite build` does not type-check.

---

## 10. Rollback

```bash
# Code: redeploy the previous commit
git checkout <previous-good-sha>
# then re-run the deploy (or push that sha to main)

# Database: always dump before a deploy, restore from that dump
mysqldump -u USER -p DBNAME > backup-2026-09-02.sql
mysql -u USER -p DBNAME < backup-2026-09-01.sql
```

Take a `mysqldump` **before every deploy that includes a migration**. The migrations'
`down()` methods exist but have never been exercised in production — treat the dump as
the real rollback path.
