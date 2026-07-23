# MonitorFlare – Service Health & Uptime Status Page

A modern, high-performance service and API uptime monitoring solution powered by **Cloudflare Workers, Elysia, Drizzle ORM, and Cloudflare D1**.

Includes a public status page, per-service health metrics, Globalping multi-region testing, customizable alert templates, incident banners, secret management, dark/light themes, and automated Telegram backups.

---

## ⚡ Features & Updates

- **Configurable Admin Panel Path** — Set custom hidden admin routes in `wrangler.toml` via `ADMIN_PANEL_PATH = "/manage-x7k9"`. Unconfigured `/admin` returns `404 Not Found`.
- **Globalping API Integration** — Run health checks directly from Cloudflare Workers or remotely from specific regions (e.g. EU, US, DE) via Globalping API.
- **Secure Secret Management** — Cryptographic Web Crypto SHA-256 / PBKDF2 password hashing & HMAC-SHA256 JWT sessions via Cloudflare Worker Secrets.
- **Custom Brand Aesthetics & Palette** — Custom brand name, brand logo, and CSS `--brand-color` picker accenting both Light & Dark modes.
- **Incident Announcements (Banners)** — Create active incident banners displayed directly between the Brand Header and Services list.
- **Service URL Visibility Toggle** — Toggle public visibility of target URLs per service.
- **Customizable Message Templates** — Edit Service DOWN and RECOVERY alert templates with dynamic placeholders (`{{service_name}}`, `{{status_code}}`, `{{time}}`, etc.).
- **System Backup & Restore (Telegram Support)** — Export/import complete system JSON backups. Automatically send backup files as document attachments to a separate `TELEGRAM_BACKUP_CHAT_ID`.

---

## 🔒 Secret Configuration (`wrangler secret`)

Do **NOT** store plain text passwords or secrets in `wrangler.toml`. Set production secrets using Wrangler CLI:

```bash
# Admin password hash (SHA-256)
wrangler secret put ADMIN_PASSWORD_HASH

# JWT Session signing secret key
wrangler secret put SESSION_SECRET

# Telegram notification bot token
wrangler secret put TELEGRAM_BOT_TOKEN

# Telegram status alerts destination Chat ID
wrangler secret put TELEGRAM_CHAT_ID

# Telegram JSON backup file destination Chat ID (independent destination)
wrangler secret put TELEGRAM_BACKUP_CHAT_ID
```

> [!NOTE]
> `TELEGRAM_CHAT_ID` receives status DOWN / RECOVERY alert messages, while `TELEGRAM_BACKUP_CHAT_ID` receives system backup JSON document files.

---

## 🚀 Deployment & Local Testing

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Apply Database Migrations**
   ```bash
   npm run db:migrate:local
   ```

3. **Start Local Development**
   ```bash
   npm run dev
   ```

4. **Deploy to Cloudflare Workers**
   ```bash
   npm run db:migrate:remote
   npm run deploy
   ```

---

## 💻 Environment Variables (`wrangler.toml`)

```toml
name = "monitorflare"
main = "src/index.ts"
compatibility_date = "2024-09-23"

[[d1_databases]]
binding = "DB"
database_name = "monitorflare"
database_id = "your-database-id"

[vars]
BASE_URL = "https://your-app.workers.dev"
ADMIN_USERNAME = "admin"
ADMIN_PANEL_PATH = "/manage-x7k9"

[triggers]
crons = ["*/5 * * * *"]
```
