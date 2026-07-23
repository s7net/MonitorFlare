import { Html } from '@elysiajs/html';

export function AdminLogin({ adminPath = '/manage-x7k9' }: { adminPath?: string }) {
  return (
    <html lang="en" data-theme="system">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Admin Login</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 240 10% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 240 10% 3.9%;
            --muted: 240 4.8% 95.9%;
            --muted-foreground: 240 3.8% 46.1%;
            --border: 240 5.9% 90%;
            --brand-color: #6366f1;
            --danger: #ef4444;
          }

          [data-theme="dark"] {
            --background: 240 10% 3.9%;
            --foreground: 0 0% 98%;
            --card: 240 10% 4.9%;
            --card-foreground: 0 0% 98%;
            --muted: 240 3.7% 15.9%;
            --muted-foreground: 240 5% 64.9%;
            --border: 240 3.7% 15.9%;
          }

          @media (prefers-color-scheme: dark) {
            [data-theme="system"] {
              --background: 240 10% 3.9%;
              --foreground: 0 0% 98%;
              --card: 240 10% 4.9%;
              --card-foreground: 0 0% 98%;
              --muted: 240 3.7% 15.9%;
              --muted-foreground: 240 5% 64.9%;
              --border: 240 3.7% 15.9%;
            }
          }

          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 1.25rem;
          }

          .shad-card {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.75rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }

          .shad-input {
            display: flex;
            height: 2.5rem;
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid hsl(var(--border));
            background-color: transparent;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            transition: border-color 0.15s ease;
          }
          .shad-input:focus {
            outline: none;
            border-color: var(--brand-color);
          }

          .shad-btn-primary {
            width: 100%;
            height: 2.5rem;
            border-radius: 0.375rem;
            border: none;
            background-color: var(--brand-color);
            color: #ffffff;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.15s ease;
          }
          .shad-btn-primary:hover { opacity: 0.9; }
        `}</style>
      </head>
      <body>
        <div class="shad-card p-8 w-full max-w-sm">
          <h2 class="text-xl font-bold text-center tracking-tight mb-1" id="login-title">Admin Management</h2>
          <p class="text-xs text-[hsl(var(--muted-foreground))] text-center mb-6" id="login-subtitle">Sign in to control monitors and settings</p>

          <div id="error-box" class="bg-red-500/10 text-[var(--danger)] text-xs p-3 rounded-md mb-4 hidden"></div>

          {/* STEP 1: Username & Password */}
          <form id="login-form">
            <div class="mb-4">
              <input type="text" name="username" class="shad-input" placeholder="Username" required autocomplete="username" />
            </div>
            <div class="mb-5">
              <input type="password" name="password" class="shad-input" placeholder="Password" required autocomplete="current-password" />
            </div>
            <button type="submit" id="submit-btn" class="shad-btn-primary">Sign In</button>
          </form>

          {/* STEP 2: 2FA TOTP Code */}
          <form id="totp-form" style="display: none;">
            <input type="hidden" id="preAuthToken" />
            <div class="mb-5">
              <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 text-center">
                6-Digit Authenticator Code
              </label>
              <input
                type="text"
                id="totp-code"
                class="shad-input text-center text-lg tracking-widest font-mono"
                placeholder="123456"
                maxlength="6"
                pattern="[0-9]{6}"
                inputmode="numeric"
                required
                autofocus
              />
            </div>
            <button type="submit" id="totp-submit-btn" class="shad-btn-primary">Verify 2FA Code</button>
            <button type="button" onclick="resetToStep1()" class="w-full text-xs text-[hsl(var(--muted-foreground))] hover:underline mt-3 text-center block bg-transparent border-0 cursor-pointer">
              ← Back to Sign In
            </button>
          </form>
        </div>

        <script>{`
          const BASE = window.location.origin;
          const ADMIN_PATH = '${adminPath}';

          function resetToStep1() {
            document.getElementById('login-title').textContent = 'Admin Management';
            document.getElementById('login-subtitle').textContent = 'Sign in to control monitors and settings';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('totp-form').style.display = 'none';
            document.getElementById('error-box').style.display = 'none';
          }

          document.getElementById('login-form').onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submit-btn');
            const errorBox = document.getElementById('error-box');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Verifying credentials...';
            errorBox.style.display = 'none';

            try {
              const fd = new FormData(e.target);
              const res = await fetch(BASE + '/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: fd.get('username'),
                  password: fd.get('password')
                })
              });

              const data = await res.json();

              if (res.ok && data.success) {
                if (data.requires2FA) {
                  // Switch to Step 2: 2FA TOTP Code Prompt
                  document.getElementById('preAuthToken').value = data.preAuthToken;
                  document.getElementById('login-title').textContent = '2FA Authentication';
                  document.getElementById('login-subtitle').textContent = 'Open your Google Authenticator or Authy app';
                  document.getElementById('login-form').style.display = 'none';
                  document.getElementById('totp-form').style.display = 'block';
                  document.getElementById('totp-code').focus();
                } else {
                  document.cookie = 'auth=' + data.token +
                    ';path=/' +
                    ';max-age=86400' +
                    ';SameSite=Strict' +
                    (window.location.protocol === 'https:' ? ';Secure' : '');

                  window.location.href = ADMIN_PATH;
                }
              } else {
                errorBox.textContent = data.error || 'Invalid credentials';
                errorBox.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
              }
            } catch (err) {
              errorBox.textContent = 'Connection error. Please try again.';
              errorBox.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Sign In';
            }
          };

          document.getElementById('totp-form').onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('totp-submit-btn');
            const errorBox = document.getElementById('error-box');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Validating 2FA...';
            errorBox.style.display = 'none';

            try {
              const res = await fetch(BASE + '/api/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  preAuthToken: document.getElementById('preAuthToken').value,
                  code: document.getElementById('totp-code').value,
                })
              });

              const data = await res.json();

              if (res.ok && data.success) {
                document.cookie = 'auth=' + data.token +
                  ';path=/' +
                  ';max-age=86400' +
                  ';SameSite=Strict' +
                  (window.location.protocol === 'https:' ? ';Secure' : '');

                window.location.href = ADMIN_PATH;
              } else {
                errorBox.textContent = data.error || 'Invalid 2FA code';
                errorBox.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verify 2FA Code';
              }
            } catch (err) {
              errorBox.textContent = 'Verification error. Please try again.';
              errorBox.style.display = 'block';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Verify 2FA Code';
            }
          };
        `}</script>
      </body>
    </html>
  );
}
