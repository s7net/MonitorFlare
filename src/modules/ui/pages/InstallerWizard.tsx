import { Html } from '@elysiajs/html';

export function InstallerWizard({ adminPath = '/manage-x7k9' }: { adminPath?: string }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MonitorFlare Setup Wizard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          :root {
            --background: 240 5% 8%; /* #121215 Neutral Dark Charcoal */
            --foreground: 240 5% 96%; /* #f4f4f5 High Contrast White */
            --card: 240 4% 12%; /* #1c1c20 Neutral Gray Card */
            --card-foreground: 240 5% 96%;
            --muted: 240 4% 18%; /* #29292e Charcoal Hover/Fill */
            --muted-foreground: 240 5% 72%; /* #b5b5bc Crisp Light Gray */
            --border: 240 4% 22%; /* #333339 Charcoal Border */
            --brand-color: #f6821f;
            --brand-color-hover: #e07115;
            --danger: #ef4444;
            --success: #10b981;
          }

          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .shad-card {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.75rem;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);
          }

          .shad-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.55rem 1.25rem;
            border: 1px solid hsl(var(--border));
            background-color: hsl(var(--card));
            color: hsl(var(--foreground));
            transition: all 0.15s ease;
            cursor: pointer;
          }
          .shad-btn:hover {
            background-color: hsl(var(--muted));
            border-color: var(--brand-color);
          }

          .shad-btn-primary {
            background-color: var(--brand-color);
            color: #ffffff;
            border-color: var(--brand-color);
          }
          .shad-btn-primary:hover {
            background-color: var(--brand-color-hover);
          }

          .shad-input {
            display: flex;
            height: 2.5rem;
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid hsl(var(--border));
            background-color: hsl(var(--background));
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            transition: border-color 0.15s ease;
          }
          .shad-input:focus {
            outline: none;
            border-color: var(--brand-color);
          }

          .step-dot {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            border: 1px solid hsl(var(--border));
            background-color: hsl(var(--muted));
            color: hsl(var(--muted-foreground));
            transition: all 0.2s ease;
          }
          .step-dot.active {
            background-color: var(--brand-color);
            color: #ffffff;
            border-color: var(--brand-color);
          }
          .step-dot.completed {
            background-color: var(--success);
            color: #ffffff;
            border-color: var(--success);
          }

          .wizard-step { display: none; }
          .wizard-step.active { display: block; }
        `}</style>
      </head>
      <body>
        <div class="w-full max-w-2xl p-4 my-8">
          
          {/* Header Brand Title */}
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-3">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f6821f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold tracking-tight m-0">MonitorFlare Setup Wizard</h1>
            <p class="text-xs text-[hsl(var(--muted-foreground))] mt-1.5">
              Welcome! Let's configure your Cloudflare Workers monitoring system in 2 minutes.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div class="shad-card p-4 mb-6">
            <div class="flex items-center justify-between relative px-2">
              <div class="flex flex-col items-center gap-1 z-10">
                <div id="dot-1" class="step-dot active">1</div>
                <span class="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Welcome</span>
              </div>
              <div class="flex flex-col items-center gap-1 z-10">
                <div id="dot-2" class="step-dot">2</div>
                <span class="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Account</span>
              </div>
              <div class="flex flex-col items-center gap-1 z-10">
                <div id="dot-3" class="step-dot">3</div>
                <span class="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Telegram</span>
              </div>
              <div class="flex flex-col items-center gap-1 z-10">
                <div id="dot-4" class="step-dot">4</div>
                <span class="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Brand</span>
              </div>
              <div class="flex flex-col items-center gap-1 z-10">
                <div id="dot-5" class="step-dot">5</div>
                <span class="text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">Launch</span>
              </div>
            </div>
          </div>

          {/* Main Wizard Card */}
          <div class="shad-card p-6 md:p-8">
            <form id="installer-form" onsubmit="handleWizardSubmit(event)">
              
              {/* STEP 1: WELCOME & ENVIRONMENT CHECK */}
              <div id="step-1" class="wizard-step active">
                <h2 class="text-lg font-bold tracking-tight mb-2">Step 1: Environment & D1 Database Check</h2>
                <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                  MonitorFlare uses Cloudflare Workers and Cloudflare D1 Serverless Database.
                </p>

                <div class="p-4 rounded-lg border border-[hsl(var(--border))] bg-muted/40 mb-6 space-y-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium">Cloudflare Workers Runtime</span>
                    <span class="text-emerald-400 font-bold">✓ Active</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium">Cloudflare D1 Binding (env.DB)</span>
                    <span id="d1-check-status" class="text-emerald-400 font-bold">✓ Connected</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="font-medium">Web Crypto API (RFC 6238 TOTP)</span>
                    <span class="text-emerald-400 font-bold">✓ Ready</span>
                  </div>
                </div>

                <div class="flex justify-end">
                  <button type="button" onclick="goToStep(2)" class="shad-btn shad-btn-primary">
                    Next: Admin Security →
                  </button>
                </div>
              </div>

              {/* STEP 2: ADMIN SECURITY */}
              <div id="step-2" class="wizard-step">
                <h2 class="text-lg font-bold tracking-tight mb-2">Step 2: Admin Account Credentials</h2>
                <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                  Set the master administrator username and secure login password for your admin dashboard.
                </p>

                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Admin Username</label>
                    <input type="text" id="install-username" class="shad-input" value="admin" placeholder="admin" required />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Admin Password</label>
                    <input type="password" id="install-password" class="shad-input" placeholder="Create a strong password..." minlength="6" required />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Confirm Admin Password</label>
                    <input type="password" id="install-password-confirm" class="shad-input" placeholder="Confirm password..." minlength="6" required />
                  </div>
                </div>

                <div class="flex justify-between">
                  <button type="button" onclick="goToStep(1)" class="shad-btn">← Back</button>
                  <button type="button" onclick="validateAndGoToStep(3)" class="shad-btn shad-btn-primary">
                    Next: Telegram Bot →
                  </button>
                </div>
              </div>

              {/* STEP 3: TELEGRAM BOT */}
              <div id="step-3" class="wizard-step">
                <h2 class="text-lg font-bold tracking-tight mb-2">Step 3: Telegram Alert Bot (Optional)</h2>
                <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                  Receive instant Telegram notifications when services go DOWN or recover. You can also configure dedicated backup bots later.
                </p>

                <div class="space-y-4 mb-4">
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Telegram Bot Token (Optional)</label>
                    <input type="text" id="install-botToken" class="shad-input font-mono text-xs" placeholder="123456789:ABCDefgh..." />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Alert Chat ID / Channel ID (Optional)</label>
                    <input type="text" id="install-chatId" class="shad-input font-mono text-xs" placeholder="-100123456789" />
                  </div>
                </div>

                <div id="telegram-test-result" class="mb-6 p-3 rounded text-xs hidden"></div>

                <div class="flex justify-between items-center">
                  <button type="button" onclick="goToStep(2)" class="shad-btn">← Back</button>
                  <div class="flex gap-2">
                    <button type="button" onclick="testTelegramInInstaller()" id="install-test-notif-btn" class="shad-btn">
                      ✈️ Test Connection
                    </button>
                    <button type="button" onclick="goToStep(4)" class="shad-btn shad-btn-primary">
                      Next: Brand Setup →
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 4: BRAND SETUP */}
              <div id="step-4" class="wizard-step">
                <h2 class="text-lg font-bold tracking-tight mb-2">Step 4: Status Page Branding</h2>
                <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                  Customize the brand title and logo URL displayed on your public monitoring status page.
                </p>

                <div class="space-y-4 mb-6">
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Brand Name</label>
                    <input type="text" id="install-brandName" class="shad-input" value="MonitorFlare Status" placeholder="MonitorFlare Status" required />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Brand Logo URL (Optional)</label>
                    <input type="url" id="install-brandLogoUrl" class="shad-input" placeholder="https://example.com/logo.png" />
                  </div>
                </div>

                <div class="flex justify-between">
                  <button type="button" onclick="goToStep(3)" class="shad-btn">← Back</button>
                  <button type="button" onclick="goToStep(5)" class="shad-btn shad-btn-primary">
                    Next: Auto-Bootstrap & Launch →
                  </button>
                </div>
              </div>

              {/* STEP 5: LAUNCH & BOOTSTRAP */}
              <div id="step-5" class="wizard-step">
                <h2 class="text-lg font-bold tracking-tight mb-2">Step 5: D1 Schema Auto-Bootstrapper</h2>
                <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                  Clicking the button below will automatically create all D1 Database tables (`services`, `health_checks`, `system_settings`, `incidents`), insert your settings, and launch MonitorFlare.
                </p>

                <div id="bootstrap-status-card" class="p-4 rounded-lg border border-[hsl(var(--border))] bg-muted/30 text-xs mb-6 space-y-2">
                  <div class="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span>⚡️ D1 Database Schema Ready to Initialize</span>
                  </div>
                  <p class="text-[hsl(var(--muted-foreground))] m-0">
                    No command line or SQL migrations needed. Zero-config automatic deployment.
                  </p>
                </div>

                <div id="install-error-box" class="p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400 mb-4 hidden"></div>

                <div class="flex justify-between">
                  <button type="button" onclick="goToStep(4)" class="shad-btn">← Back</button>
                  <button type="submit" id="install-finish-btn" class="shad-btn shad-btn-primary text-sm font-bold">
                    🚀 Run Auto-Installer & Launch
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>

        <script>{`
          const BASE = window.location.origin;
          const ADMIN_PATH = '${adminPath}';
          let currentStep = 1;

          function goToStep(step) {
            currentStep = step;
            document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
            document.getElementById('step-' + step).classList.add('active');

            for (let i = 1; i <= 5; i++) {
              const dot = document.getElementById('dot-' + i);
              dot.classList.remove('active', 'completed');
              if (i < step) dot.classList.add('completed');
              else if (i === step) dot.classList.add('active');
            }
          }

          function validateAndGoToStep(nextStep) {
            const pwd = document.getElementById('install-password').value;
            const confirmPwd = document.getElementById('install-password-confirm').value;

            if (!pwd || pwd.length < 6) {
              alert('Please enter a password with at least 6 characters.');
              return;
            }
            if (pwd !== confirmPwd) {
              alert('Passwords do not match. Please re-enter.');
              return;
            }
            goToStep(nextStep);
          }

          async function testTelegramInInstaller() {
            const btn = document.getElementById('install-test-notif-btn');
            const resultBox = document.getElementById('telegram-test-result');
            const botToken = document.getElementById('install-botToken').value;
            const chatId = document.getElementById('install-chatId').value;

            if (!botToken || !chatId) {
              alert('Please enter both Bot Token and Chat ID to test.');
              return;
            }

            btn.disabled = true;
            btn.textContent = 'Testing...';
            resultBox.classList.remove('hidden');
            resultBox.className = 'mb-6 p-3 rounded text-xs bg-muted';
            resultBox.textContent = 'Sending test notification message via Telegram...';

            try {
              const res = await fetch(BASE + '/api/install/test-telegram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ botToken, chatId }),
              });

              const data = await res.json();
              btn.disabled = false;
              btn.textContent = '✈️ Test Connection';

              if (res.ok && data.success) {
                resultBox.className = 'mb-6 p-3 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
                resultBox.textContent = '✓ Test message sent successfully to Telegram!';
              } else {
                resultBox.className = 'mb-6 p-3 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/30';
                resultBox.textContent = '✗ ' + (data.error || 'Failed to send Telegram test message');
              }
            } catch (err) {
              btn.disabled = false;
              btn.textContent = '✈️ Test Connection';
              resultBox.className = 'mb-6 p-3 rounded text-xs bg-red-500/10 text-red-400 border border-red-500/30';
              resultBox.textContent = 'Error testing Telegram connection.';
            }
          }

          async function handleWizardSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('install-finish-btn');
            const errBox = document.getElementById('install-error-box');

            btn.disabled = true;
            btn.textContent = '⚡️ Bootstrapping D1 Database & Installing...';
            errBox.classList.add('hidden');

            const payload = {
              adminUsername: document.getElementById('install-username').value,
              adminPassword: document.getElementById('install-password').value,
              botToken: document.getElementById('install-botToken').value,
              chatId: document.getElementById('install-chatId').value,
              brandName: document.getElementById('install-brandName').value,
              brandLogoUrl: document.getElementById('install-brandLogoUrl').value,
            };

            try {
              const res = await fetch(BASE + '/api/install/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const data = await res.json();

              if (res.ok && data.success) {
                btn.textContent = '✓ Installed! Redirecting...';
                setTimeout(() => {
                  window.location.href = ADMIN_PATH + '/login';
                }, 1200);
              } else {
                btn.disabled = false;
                btn.textContent = '🚀 Run Auto-Installer & Launch';
                errBox.textContent = 'Installation error: ' + (data.error || 'Unknown error');
                errBox.classList.remove('hidden');
              }
            } catch (err) {
              btn.disabled = false;
              btn.textContent = '🚀 Run Auto-Installer & Launch';
              errBox.textContent = 'Connection failure during auto-installation.';
              errBox.classList.remove('hidden');
            }
          }
        `}</script>
      </body>
    </html>
  );
}
