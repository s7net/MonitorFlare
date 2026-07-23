# MonitorFlare – Enterprise Cloudflare-Native Service Health & Uptime Status Page

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Serverless-f38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![ElysiaJS](https://img.shields.io/badge/Elysia.js-High_Performance-black?style=for-the-badge&logo=bun&logoColor=white)](https://elysiajs.com/)
[![Cloudflare D1](https://img.shields.io/badge/Cloudflare_D1-Serverless_SQL-f38020?style=for-the-badge&logo=sqlite&logoColor=white)](https://developers.cloudflare.com/d1/)
[![2FA TOTP](https://img.shields.io/badge/2FA_Security-RFC_6238_TOTP-emerald?style=for-the-badge&logo=googleauthenticator&logoColor=white)](#-two-factor-authentication-2fa)

A modern, high-performance, serverless service health and API uptime monitoring platform powered by **Cloudflare Workers, Elysia, Web Crypto API, Drizzle ORM, and Cloudflare D1 Database**.

Includes a public status page, Cloudflare-style admin dashboard UI, 2FA Authenticator protection, Globalping multi-region testing, Heartbeat passive cron monitoring, retry failure thresholds, customizable alert templates, active incident banners, SLA performance CSV exports, and automated Telegram backups.

---

## ⚡ Key Features

- **🎨 Cloudflare-Style Admin Dashboard**: Sleek vertical left sidebar navigation layout matching Cloudflare's enterprise design system with neutral Charcoal Gray dark mode and breadcrumb navigation.
- **🔐 Two-Factor Authentication (RFC 6238 Web Crypto TOTP)**: Full TOTP Authenticator app support (Google Authenticator, Authy, 1Password, Bitwarden) with QR code setup modal and 2-step login verification built using native `crypto.subtle`.
- **⏱️ Failure Retry Thresholds (`maxRetries`)**: Eliminate false positive alerts! Outage alerts only trigger after *N* consecutive failed checks (e.g. 10 retries). Recovers immediately on the 1st healthy check.
- **💓 Heartbeat Passive Monitoring**: Monitor background cron jobs, server scripts, and microservices via unique passive ping URLs (`/api/heartbeat/:token`).
- **🌍 Globalping Multi-Region Testing**: Run HTTP/Ping checks directly from Cloudflare Workers edge nodes or remotely from specific global regions (EU, US, DE, Asia).
- **🔒 Configurable Hidden Admin Route**: Set custom admin panel routes in `wrangler.toml` (e.g., `ADMIN_PANEL_PATH = "/manage-x7k9"`). Unconfigured `/admin` routes return `404 Not Found`.
- **💾 Automated Telegram System Backups**: Schedule automated JSON system backups sent as document attachments to a dedicated Telegram Bot & Chat ID (`autoBackupBotToken`, `autoBackupChatId`).
- **📢 Active Incident Banners**: Publish active incident/maintenance notices displayed directly on the public status page.
- **📊 SLA Performance Exports**: One-click export of system SLA performance data into CSV format.
- **🎨 Custom CSS & JS Injection**: Inject custom stylesheets or analytics scripts into your public status page.
- **⚡ 1-Click Client-Side Auto-Installer (`monitorflare-installer`)**: Standalone 100% browser client-side React SPA installer tool for zero-config Cloudflare D1 provisioning and deployment.

---

## 🔐 Two-Factor Authentication (2FA)

Protect your master admin panel using standard 6-digit TOTP Authenticator applications:

1. Open **Admin Dashboard** -> **Security & 2FA** tab.
2. Click **🔒 Setup & Enable 2FA**.
3. Scan the generated QR Code with Google Authenticator, Authy, 1Password, or Bitwarden.
4. Enter the 6-digit verification code to confirm activation.

---

## 🚀 Deployment & Installation

### Option A: Standalone 1-Click Web Installer (`monitorflare-installer`)
Use our 100% browser client-side installer tool [monitorflare-installer](https://github.com/s7net/monitorflare-installer) for zero-CLI deployment directly from your web browser!

```bash
git clone https://github.com/s7net/monitorflare-installer.git
cd monitorflare-installer
npm install
npm run dev
```

---

### Option B: Manual CLI Deployment

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/s7net/MonitorFlare.git
   cd MonitorFlare
   npm install
   ```

2. **Create Cloudflare D1 Database**
   ```bash
   npx wrangler d1 create monitorflare
   ```
   *Copy the returned `database_id` into your `wrangler.toml`.*

3. **Apply Remote D1 Migrations**
   ```bash
   npx wrangler d1 migrations apply monitorflare --remote
   ```

4. **Set Production Secrets**
   ```bash
   wrangler secret put ADMIN_PASSWORD_HASH
   wrangler secret put SESSION_SECRET
   wrangler secret put TELEGRAM_BOT_TOKEN
   wrangler secret put TELEGRAM_CHAT_ID
   ```

5. **Deploy to Cloudflare Workers**
   ```bash
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
database_id = "your-database-id-here"

[vars]
BASE_URL = "https://monitorflare.noc-42f.workers.dev"
ADMIN_USERNAME = "admin"
ADMIN_PANEL_PATH = "/manage-x7k9"

[triggers]
crons = ["* * * * *"] # Executes health checks every 60 seconds
```

---

## 🛡️ License & Author

Developed with ❤️ by **[s7net](https://github.com/s7net)**. Released under the MIT License.
