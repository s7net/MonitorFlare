import { Html } from '@elysiajs/html';

export function AdminDashboard({ adminPath = '/manage-x7k9' }: { adminPath?: string }) {
  return (
    <html lang="en" data-theme="system">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>MonitorFlare Admin Dashboard</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          :root {
            --background: 0 0% 98%;
            --foreground: 240 10% 3.9%;
            --card: 0 0% 100%;
            --card-foreground: 240 10% 3.9%;
            --muted: 240 4.8% 95.9%;
            --muted-foreground: 240 3.8% 46.1%;
            --border: 240 5.9% 90%;
            --brand-color: #f6821f; /* Standard Cloudflare Signature Accent */
            --brand-color-hover: #e07115;
            --danger: #ef4444;
            --success: #10b981;
            --sidebar-bg: #ffffff;
            --sidebar-hover: #f3f4f6;
            --sidebar-active-bg: #f3f4f6;
            --sidebar-active-text: #111827;
          }

          /* Modern Neutral Charcoal Gray Dark Mode Palette (No Navy Tint) */
          [data-theme="dark"] {
            --background: 240 5% 8%; /* #121215 Neutral Dark Charcoal */
            --foreground: 240 5% 96%; /* #f4f4f5 High Contrast White */
            --card: 240 4% 12%; /* #1c1c20 Neutral Gray Card */
            --card-foreground: 240 5% 96%;
            --muted: 240 4% 18%; /* #29292e Charcoal Hover/Fill */
            --muted-foreground: 240 5% 72%; /* #b5b5bc Crisp Light Gray */
            --border: 240 4% 22%; /* #333339 Charcoal Border */
            --sidebar-bg: 240 5% 10%;
            --sidebar-hover: 240 4% 18%;
            --sidebar-active-bg: 240 4% 18%;
            --sidebar-active-text: #ffffff;
          }

          @media (prefers-color-scheme: dark) {
            [data-theme="system"] {
              --background: 240 5% 8%;
              --foreground: 240 5% 96%;
              --card: 240 4% 12%;
              --card-foreground: 240 5% 96%;
              --muted: 240 4% 18%;
              --muted-foreground: 240 5% 72%;
              --border: 240 4% 22%;
              --sidebar-bg: 240 5% 10%;
              --sidebar-hover: 240 4% 18%;
              --sidebar-active-bg: 240 4% 18%;
              --sidebar-active-text: #ffffff;
            }
          }

          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            margin: 0;
            padding: 0;
            min-height: 100vh;
            transition: background-color 0.2s ease, color 0.2s ease;
          }

          .shad-card {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.15);
          }

          .shad-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            font-size: 0.8125rem;
            font-weight: 500;
            padding: 0.45rem 0.875rem;
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

          .shad-btn-danger {
            background-color: rgba(239, 68, 68, 0.15);
            color: var(--danger);
            border-color: rgba(239, 68, 68, 0.3);
          }
          .shad-btn-danger:hover {
            background-color: rgba(239, 68, 68, 0.25);
          }

          .shad-input {
            display: flex;
            height: 2.25rem;
            width: 100%;
            border-radius: 0.375rem;
            border: 1px solid hsl(var(--border));
            background-color: hsl(var(--card));
            padding: 0.25rem 0.75rem;
            font-size: 0.875rem;
            color: hsl(var(--foreground));
            transition: border-color 0.15s ease;
          }
          .shad-input:focus {
            outline: none;
            border-color: var(--brand-color);
          }

          .cf-sidebar-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 0.5rem 0.75rem;
            margin-bottom: 0.125rem;
            border-radius: 0.375rem;
            font-size: 0.84rem;
            font-weight: 500;
            color: hsl(var(--muted-foreground));
            background-color: transparent;
            border: none;
            cursor: pointer;
            text-align: left;
            transition: all 0.12s ease;
          }
          .cf-sidebar-item:hover {
            background-color: hsl(var(--muted));
            color: hsl(var(--foreground));
          }
          .cf-sidebar-item.active {
            background-color: hsl(var(--muted));
            color: hsl(var(--foreground));
            font-weight: 600;
          }

          .tab-content { display: none; }
          .tab-content.active { display: block; }

          .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(4px);
            z-index: 999;
            align-items: center;
            justify-content: center;
          }
          .modal-overlay.open { display: flex; }

          .modal-box {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.5rem;
            padding: 1.75rem;
            width: 100%;
            max-width: 580px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
          }
        `}</style>
      </head>
      <body>
        <div class="min-h-screen flex flex-col md:flex-row">
          
          {/* CLOUDFLARE LEFT SIDEBAR */}
          <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r border-[hsl(var(--border))] flex-shrink-0 flex flex-col bg-[hsl(var(--card))]">
            
            {/* Sidebar Brand Header */}
            <div class="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f6821f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
                <div class="font-bold text-sm tracking-tight text-[hsl(var(--foreground))]">MonitorFlare</div>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav class="p-2 flex-1 overflow-y-auto">
              <div class="text-[10px] uppercase font-semibold text-[hsl(var(--muted-foreground))] mb-1.5 px-2 tracking-wider">Core Operations</div>
              
              <button class="cf-sidebar-item active" onclick="switchTab('services', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                  <span>Monitored Services</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('test', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>Instant Tester</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('notifications', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  <span>Notifications</span>
                </div>
              </button>

              <div class="text-[10px] uppercase font-semibold text-[hsl(var(--muted-foreground))] mt-4 mb-1.5 px-2 tracking-wider">Settings & Customization</div>

              <button class="cf-sidebar-item" onclick="switchTab('brand', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
                  <span>Brand Settings</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('security', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Security & 2FA</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('templates', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Message Templates</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('incidents', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                  <span>Incident Banners</span>
                </div>
              </button>

              <button class="cf-sidebar-item" onclick="switchTab('backup', event)">
                <div class="flex items-center gap-2.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <span>Backup & Restore</span>
                </div>
              </button>
            </nav>

            {/* Sidebar Footer Link */}
            <div class="p-3 border-t border-[hsl(var(--border))] text-xs text-[hsl(var(--muted-foreground))]">
              <a href="/" target="_blank" class="hover:underline flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] no-underline">
                <span>Public Status Page</span>
                <span>↗</span>
              </a>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main class="flex-1 flex flex-col min-w-0 overflow-y-auto">
            
            {/* Top Header Bar with Dark Mode Toggle */}
            <header class="h-14 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 flex items-center justify-between">
              <div class="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Admin</span>
                <span>/</span>
                <span id="breadcrumb-title" class="font-semibold text-[hsl(var(--foreground))]">Services</span>
              </div>

              <div class="flex items-center gap-3">
                <button class="shad-btn text-xs" onclick="toggleTheme()">
                  <span id="theme-icon-svg" class="inline-flex items-center"></span>
                  <span id="theme-text" class="ml-1.5 text-xs font-medium">Dark Mode</span>
                </button>
                <a href="/" target="_blank" class="shad-btn text-xs">Public Page ↗</a>
                <button onclick="logout()" class="shad-btn shad-btn-danger text-xs">Logout</button>
              </div>
            </header>

            {/* Main Content Body */}
            <div class="p-6 md:p-8 max-w-6xl w-full mx-auto">
              
              {/* TAB 1: SERVICES */}
              <div id="tab-services" class="tab-content active">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h1 class="text-xl font-bold tracking-tight m-0">Monitored Services</h1>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-1">Configure and manage active HTTP, Ping, and Heartbeat health monitors.</p>
                  </div>
                  <button onclick="openServiceModal()" class="shad-btn shad-btn-primary">+ Add Service</button>
                </div>
                <div id="services-list">Loading services...</div>
              </div>

              {/* TAB 2: INSTANT TEST */}
              <div id="tab-test" class="tab-content">
                <div class="shad-card p-6">
                  <h1 class="text-xl font-bold tracking-tight mb-2">Live Instant Monitor Tester</h1>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                    Test any target URL, hostname, or IP address in real-time to verify status detection before adding to monitors.
                  </p>

                  <form id="standalone-test-form" onsubmit="runStandaloneTest(event)">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Check Engine</label>
                        <select id="test-checkType" class="shad-input" onchange="toggleTestEngineOptions()">
                          <option value="direct">Direct Worker GET</option>
                          <option value="globalping">Globalping Multi-Region</option>
                        </select>
                      </div>
                      <div id="test-gp-type-group" style="display: none;">
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Globalping Protocol</label>
                        <select id="test-globalpingType" class="shad-input" onchange="toggleTestEngineOptions()">
                          <option value="http">HTTP / HTTPS Request</option>
                          <option value="ping">ICMP Ping</option>
                        </select>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label id="test-target-label" class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Target URL</label>
                      <input type="text" id="test-url" class="shad-input" placeholder="https://api.example.com/health" required />
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4" id="test-http-options-group">
                      <div>
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">HTTP Method</label>
                        <select id="test-method" class="shad-input">
                          <option value="GET">GET</option>
                          <option value="POST">POST</option>
                          <option value="HEAD">HEAD</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Expected Status Code</label>
                        <input type="number" id="test-expected" class="shad-input" value="200" />
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Timeout (ms)</label>
                        <input type="number" id="test-timeout" class="shad-input" value="10000" required />
                      </div>
                      <div id="test-region-group" style="display: none;">
                        <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Globalping Regions</label>
                        <input type="text" id="test-checkRegions" class="shad-input" placeholder="EU, US, DE, Asia" />
                      </div>
                    </div>

                    <button type="submit" id="test-run-btn" class="shad-btn shad-btn-primary">
                      ⚡️ Run Instant Test
                    </button>
                  </form>

                  <div id="test-results-container" class="mt-6 hidden">
                    <h3 class="text-sm font-semibold mb-3">Test Result Output</h3>
                    <div id="test-results-card" class="p-4 rounded-lg border"></div>
                  </div>
                </div>
              </div>

              {/* TAB 3: NOTIFICATIONS */}
              <div id="tab-notifications" class="tab-content">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h1 class="text-xl font-bold tracking-tight m-0">Notification Integrations</h1>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-1">Configure Telegram, Slack, Discord, and Webhook alert destinations.</p>
                  </div>
                  <button onclick="openNotifModal()" class="shad-btn shad-btn-primary">+ Add Integration</button>
                </div>
                <div id="notifs-list">Loading integrations...</div>
              </div>

              {/* TAB 4: BRAND SETTINGS */}
              <div id="tab-brand" class="tab-content">
                {/* Brand Settings */}
                <div class="shad-card p-6 mb-6">
                  <h2 class="text-lg font-semibold tracking-tight mb-5">Brand Settings</h2>
                  <form id="brand-form" onsubmit="saveBrandSettings(event)">
                    <div class="mb-4">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Brand Name</label>
                      <input type="text" id="setting-brandName" class="shad-input" placeholder="MonitorFlare" required />
                    </div>
                    <div class="mb-5">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Brand Logo URL</label>
                      <input type="url" id="setting-brandLogoUrl" class="shad-input" placeholder="https://example.com/logo.png" />
                    </div>
                    <button type="submit" class="shad-btn shad-btn-primary">Save Brand Settings</button>
                  </form>
                </div>

                {/* Custom CSS / JS Editor */}
                <div class="shad-card p-6">
                  <h2 class="text-lg font-semibold tracking-tight mb-2">Custom CSS & JS Injection</h2>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] mb-4">Inject custom styles or analytics scripts into your public status page.</p>
                  <form id="custom-code-form" onsubmit="saveCustomCodeSettings(event)">
                    <div class="mb-4">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Custom CSS</label>
                      <textarea id="setting-customCss" class="shad-input h-24 py-2 font-mono text-xs" placeholder=".shad-card { border-radius: 12px; }"></textarea>
                    </div>
                    <div class="mb-5">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Custom JavaScript</label>
                      <textarea id="setting-customJs" class="shad-input h-24 py-2 font-mono text-xs" placeholder="console.log('Status page custom script loaded');"></textarea>
                    </div>
                    <button type="submit" class="shad-btn shad-btn-primary">Save Custom CSS / JS</button>
                  </form>
                </div>
              </div>

              {/* TAB 5: SECURITY & 2FA */}
              <div id="tab-security" class="tab-content">
                <div class="shad-card p-6">
                  <h2 class="text-lg font-semibold tracking-tight mb-2 flex items-center gap-2">
                    <span>🔐 Two-Factor Authentication (2FA Authenticator)</span>
                  </h2>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] mb-5 leading-relaxed">
                    Protect your admin panel with TOTP Authenticator apps (Google Authenticator, Authy, 1Password, Bitwarden).
                  </p>

                  <div class="flex items-center justify-between p-4 rounded-lg border border-[hsl(var(--border))] bg-muted/40 flex-wrap gap-4">
                    <div>
                      <div class="text-xs font-semibold mb-1">2FA Status</div>
                      <div id="2fa-status-badge" class="text-sm font-bold text-amber-500">
                        Loading 2FA status...
                      </div>
                    </div>

                    <div id="2fa-actions">
                      <button onclick="start2FASetup()" id="2fa-setup-btn" class="shad-btn shad-btn-primary">
                        🔒 Setup & Enable 2FA
                      </button>
                      <button onclick="disable2FA()" id="2fa-disable-btn" class="shad-btn shad-btn-danger" style="display: none;">
                        🔓 Disable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 6: MESSAGE TEMPLATES */}
              <div id="tab-templates" class="tab-content">
                <div class="shad-card p-6">
                  <h1 class="text-xl font-bold tracking-tight mb-2">Custom Alert Templates</h1>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
                    Available Placeholders: <code>&#123;&#123;service_name&#125;&#125;</code>, <code>&#123;&#123;service_url&#125;&#125;</code>, <code>&#123;&#123;time&#125;&#125;</code>, <code>&#123;&#123;status_code&#125;&#125;</code>, <code>&#123;&#123;response_time&#125;&#125;</code>, <code>&#123;&#123;check_type&#125;&#125;</code>, <code>&#123;&#123;region&#125;&#125;</code>, <code>&#123;&#123;error&#125;&#125;</code>
                  </p>
                  <form id="template-form" onsubmit="saveTemplateSettings(event)">
                    <div class="mb-4">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Service DOWN Message Template</label>
                      <textarea id="setting-downTemplate" class="shad-input h-32 py-2" required></textarea>
                    </div>
                    <div class="mb-5">
                      <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Service RECOVERY Message Template</label>
                      <textarea id="setting-recoveryTemplate" class="shad-input h-32 py-2" required></textarea>
                    </div>
                    <button type="submit" class="shad-btn shad-btn-primary">Save Message Templates</button>
                  </form>
                </div>
              </div>

              {/* TAB 7: INCIDENTS */}
              <div id="tab-incidents" class="tab-content">
                <div class="flex justify-between items-center mb-6">
                  <div>
                    <h1 class="text-xl font-bold tracking-tight m-0">Incident Announcements</h1>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-1">Publish warning or maintenance banners on the public status page.</p>
                  </div>
                  <button onclick="openIncidentModal()" class="shad-btn shad-btn-primary">+ Create Incident Banner</button>
                </div>
                <div id="incidents-list">Loading incidents...</div>
              </div>

              {/* TAB 8: BACKUP & RESTORE */}
              <div id="tab-backup" class="tab-content">
                <div class="shad-card p-6">
                  <h1 class="text-xl font-bold tracking-tight mb-2">System Backup & Restore</h1>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] mb-6 leading-relaxed">
                    Download a complete JSON backup of system settings, monitors, message templates, and banners, or restore settings from a backup file.
                  </p>

                  {/* Scheduled Automatic Backup Options Card */}
                  <div class="p-5 rounded-lg border border-[hsl(var(--border))] bg-muted/40 mb-8">
                    <h3 class="text-sm font-bold tracking-tight mb-2 flex items-center gap-2">
                      <span>⏱️ Scheduled Automatic Telegram Backup</span>
                    </h3>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mb-4 leading-relaxed">
                      Automatically generate a full system backup JSON file and send it to your configured Telegram Backup Chat ID according to your chosen schedule.
                    </p>

                    <form id="auto-backup-form" onsubmit="saveAutoBackupSettings(event)">
                      <div class="flex items-center gap-3 mb-4">
                        <input type="checkbox" id="setting-autoBackupTelegram" class="w-4 h-4 cursor-pointer" onchange="toggleAutoBackupIntervalView()" />
                        <label for="setting-autoBackupTelegram" class="text-xs font-semibold cursor-pointer m-0">Enable Scheduled Automatic Backup to Telegram</label>
                      </div>

                      <div id="auto-backup-interval-group" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" style="display: none;">
                        <div>
                          <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Backup Frequency Schedule</label>
                          <select id="setting-autoBackupIntervalDays" class="shad-input">
                            <option value="0.25">Every 6 Hours</option>
                            <option value="0.5">Every 12 Hours</option>
                            <option value="1">Every 24 Hours (Daily)</option>
                            <option value="3">Every 3 Days</option>
                            <option value="7">Every 7 Days (Weekly)</option>
                          </select>
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Last Automatic Backup Status</label>
                          <div id="auto-backup-last-status" class="shad-input flex items-center text-xs text-[hsl(var(--muted-foreground))] bg-muted">
                            Never sent
                          </div>
                        </div>

                        <div>
                          <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Dedicated Backup Bot Token (Optional)</label>
                          <input type="text" id="setting-autoBackupBotToken" class="shad-input" placeholder="123456789:ABC... (Leave empty to use Alert Bot)" />
                        </div>
                        <div>
                          <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Dedicated Backup Chat ID (Optional)</label>
                          <input type="text" id="setting-autoBackupChatId" class="shad-input" placeholder="-100123456789 (Leave empty to use Alert Chat)" />
                        </div>
                      </div>

                      <button type="submit" class="shad-btn shad-btn-primary">Save Auto-Backup Schedule</button>
                    </form>
                  </div>

                  {/* Manual Backup Actions */}
                  <div class="mb-8">
                    <h3 class="text-sm font-semibold mb-3">Manual Backup & Export Actions</h3>
                    <div class="flex gap-4 flex-wrap">
                      <a href="/api/admin/backup" download="monitorflare-backup.json" class="shad-btn shad-btn-primary no-underline">
                        📥 Download Complete Backup JSON
                      </a>
                      <a href="/api/admin/export/csv" download="monitorflare-sla-report.csv" class="shad-btn no-underline">
                        📊 Export SLA Performance CSV
                      </a>
                      <button onclick="sendBackupToTelegram()" class="shad-btn">
                        ✈️ Send Immediate Backup JSON to Telegram Chat
                      </button>
                    </div>
                  </div>

                  {/* Restore Options */}
                  <div class="pt-6 border-t border-[hsl(var(--border))]">
                    <h3 class="text-sm font-semibold mb-3">Restore System from JSON Backup</h3>
                    <div class="flex gap-3 items-center flex-wrap">
                      <input type="file" id="restore-file-input" accept=".json" class="shad-input max-w-xs" />
                      <button onclick="restoreFromBackup()" class="shad-btn shad-btn-primary">Restore Backup</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* MODAL: 2FA Setup */}
        <div id="2fa-setup-modal" class="modal-overlay">
          <div class="modal-box text-center">
            <h3 class="text-lg font-bold mb-2 m-0">Setup Two-Factor Authentication</h3>
            <p class="text-xs text-[hsl(var(--muted-foreground))] mb-4">
              Scan this QR Code with Google Authenticator, Authy, or 1Password.
            </p>

            <div class="flex justify-center mb-4">
              <img id="2fa-qr-img" class="w-48 h-48 border rounded-lg p-2 bg-white" alt="2FA QR Code" />
            </div>

            <div class="mb-4 text-left">
              <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1">Manual Secret Key</label>
              <div class="flex gap-2">
                <input type="text" id="2fa-secret-key" class="shad-input font-mono text-xs text-center" readonly />
                <button onclick="copy2FASecret()" class="shad-btn text-xs">Copy</button>
              </div>
            </div>

            <form onsubmit="confirmEnable2FA(event)">
              <div class="mb-4 text-left">
                <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Enter 6-Digit Authenticator Code to Confirm</label>
                <input type="text" id="2fa-confirm-code" class="shad-input text-center text-lg font-mono tracking-widest" placeholder="123456" maxlength="6" required />
              </div>
              <div id="2fa-modal-error" class="text-xs text-red-500 mb-3 hidden"></div>
              <div class="flex justify-end gap-2">
                <button type="button" onclick="close2FAModal()" class="shad-btn">Cancel</button>
                <button type="submit" id="2fa-enable-submit-btn" class="shad-btn shad-btn-primary">Activate 2FA</button>
              </div>
            </form>
          </div>
        </div>

        {/* MODAL: Service Form */}
        <div id="service-modal" class="modal-overlay">
          <div class="modal-box">
            <h3 id="service-modal-title" class="text-base font-bold mb-4 m-0">Add Service</h3>
            <form id="service-form" onsubmit="saveService(event)">
              <input type="hidden" id="service-id" />
              
              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Service Name</label>
                  <input type="text" id="service-name" class="shad-input" placeholder="My API Service" required />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Category Group</label>
                  <input type="text" id="service-groupName" class="shad-input" placeholder="Core APIs, Databases, Web" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Check Engine</label>
                  <select id="service-checkType" class="shad-input" onchange="toggleEngineOptions()">
                    <option value="direct">Direct Worker GET</option>
                    <option value="globalping">Globalping Multi-Region</option>
                    <option value="heartbeat">Heartbeat / Passive Cron Ping</option>
                  </select>
                </div>
                <div id="gp-type-group" style="display: none;">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Globalping Protocol</label>
                  <select id="service-globalpingType" class="shad-input" onchange="toggleEngineOptions()">
                    <option value="http">HTTP / HTTPS Request</option>
                    <option value="ping">ICMP Ping</option>
                  </select>
                </div>
              </div>

              <div class="mb-4" id="target-url-group">
                <label id="target-label" class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Target URL</label>
                <input type="text" id="service-url" class="shad-input" placeholder="https://api.example.com/health" />
              </div>

              {/* Heartbeat Info Group */}
              <div id="heartbeat-info-group" class="mb-4 p-3 rounded bg-indigo-500/10 border border-indigo-500/30 text-xs" style="display: none;">
                <div class="font-semibold text-indigo-400 mb-1">Heartbeat Passive Cron Ping Endpoint</div>
                <p class="text-[11px] mb-2 text-[hsl(var(--muted-foreground))]">Send HTTP POST/GET requests from your server script to this URL at regular intervals:</p>
                <div class="font-mono text-[11px] bg-muted p-2 rounded break-all" id="heartbeat-url-display">https://.../api/heartbeat/...</div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-4" id="http-options-group">
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">HTTP Method</label>
                  <select id="service-method" class="shad-input">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="HEAD">HEAD</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Expected Status Code</label>
                  <input type="number" id="service-expected" class="shad-input" value="200" />
                </div>
              </div>

              {/* Advanced HTTP Options & Retry Threshold */}
              <div class="grid grid-cols-2 gap-3 mb-4" id="advanced-http-group">
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Keyword Match (Optional)</label>
                  <input type="text" id="service-keyword" class="shad-input" placeholder="e.g. status: ok" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Custom Headers (JSON)</label>
                  <input type="text" id="service-headers" class="shad-input font-mono text-xs" placeholder='{"Authorization":"Bearer key"}' />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Max Failed Retries before Alert (e.g. 10)</label>
                  <input type="number" id="service-maxRetries" class="shad-input" value="1" min="1" max="100" placeholder="1" />
                  <div class="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
                    Only trigger Outage alert after N consecutive failed checks. Recovers immediately on 1st success.
                  </div>
                </div>
                <div id="timeout-group">
                  <label id="timeout-label" class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Timeout (ms)</label>
                  <input type="number" id="service-timeout" class="shad-input" value="10000" />
                </div>
                <div id="heartbeat-interval-group" style="display: none;">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Expected Interval (seconds)</label>
                  <input type="number" id="service-heartbeatInterval" class="shad-input" value="300" />
                </div>
                <div id="region-group" style="display: none;">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Globalping Regions</label>
                  <input type="text" id="service-checkRegions" class="shad-input" placeholder="EU, US, DE, Asia" />
                </div>
              </div>

              <div class="flex items-center gap-2 mb-4">
                <input type="checkbox" id="service-showUrl" class="w-4 h-4 cursor-pointer" checked />
                <label for="service-showUrl" class="text-xs cursor-pointer m-0">Show URL / Host to public status page users</label>
              </div>

              <div id="modal-test-result" class="mb-4 p-3 rounded text-xs hidden"></div>

              <div class="flex justify-between items-center gap-2">
                <button type="button" onclick="testModalService()" id="modal-test-btn" class="shad-btn">
                  ⚡️ Test Before Save
                </button>
                <div class="flex gap-2">
                  <button type="button" onclick="closeServiceModal()" class="shad-btn">Cancel</button>
                  <button type="submit" class="shad-btn shad-btn-primary">Save Service</button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* MODAL: Notification Integration */}
        <div id="notif-modal" class="modal-overlay">
          <div class="modal-box">
            <h3 id="notif-modal-title" class="text-base font-bold mb-4 m-0">Add Notification Integration</h3>
            <form id="notif-form" onsubmit="saveNotif(event)">
              <input type="hidden" id="notif-id" />
              <div class="mb-4">
                <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Integration Type</label>
                <select id="notif-type" class="shad-input" onchange="toggleNotifFields()">
                  <option value="telegram">Telegram Bot</option>
                  <option value="slack">Slack Webhook</option>
                  <option value="discord">Discord Webhook</option>
                  <option value="webhook">Custom JSON Webhook</option>
                </select>
              </div>

              <div id="telegram-fields">
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Telegram Bot Token</label>
                  <input type="text" id="notif-botToken" class="shad-input" placeholder="123456789:ABCDefgh..." />
                </div>
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Status Alert Chat ID (TELEGRAM_CHAT_ID)</label>
                  <input type="text" id="notif-chatId" class="shad-input" placeholder="-100123456789" />
                </div>
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Backup Chat ID (TELEGRAM_BACKUP_CHAT_ID)</label>
                  <input type="text" id="notif-backupChatId" class="shad-input" placeholder="-100987654321" />
                </div>
              </div>

              <div id="slack-fields" style="display: none;">
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Slack Webhook URL</label>
                  <input type="url" id="notif-webhookUrl" class="shad-input" placeholder="https://hooks.slack.com/services/..." />
                </div>
              </div>

              <div id="discord-fields" style="display: none;">
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Discord Webhook URL</label>
                  <input type="url" id="notif-discordWebhookUrl" class="shad-input" placeholder="https://discord.com/api/webhooks/..." />
                </div>
              </div>

              <div id="webhook-fields" style="display: none;">
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Custom Webhook Target URL</label>
                  <input type="url" id="notif-customWebhookUrl" class="shad-input" placeholder="https://api.yourdomain.com/webhook/alerts" />
                </div>
                <div class="mb-4">
                  <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Secret Header (X-MonitorFlare-Secret)</label>
                  <input type="text" id="notif-secretHeader" class="shad-input" placeholder="secret_auth_token_xyz" />
                </div>
              </div>

              <div class="flex justify-end gap-2 mt-6">
                <button type="button" onclick="closeNotifModal()" class="shad-btn">Cancel</button>
                <button type="submit" class="shad-btn shad-btn-primary">Save Integration</button>
              </div>
            </form>
          </div>
        </div>

        {/* MODAL: Incident Banner */}
        <div id="incident-modal" class="modal-overlay">
          <div class="modal-box">
            <h3 id="incident-modal-title" class="text-base font-bold mb-4 m-0">Create Incident Banner</h3>
            <form id="incident-form" onsubmit="saveIncident(event)">
              <input type="hidden" id="incident-id" />
              <div class="mb-4">
                <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Incident Title</label>
                <input type="text" id="incident-title-input" class="shad-input" placeholder="Scheduled Maintenance" required />
              </div>
              <div class="mb-4">
                <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Description Message</label>
                <textarea id="incident-message-input" class="shad-input h-24 py-2" placeholder="Descriptive incident note..." required></textarea>
              </div>
              <div class="mb-4">
                <label class="block text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-1.5">Severity Level</label>
                <select id="incident-severity-input" class="shad-input">
                  <option value="info">Info / Notice</option>
                  <option value="warning" selected>Warning</option>
                  <option value="critical">Critical / Major Outage</option>
                </select>
              </div>
              <div class="flex items-center gap-2 mb-6">
                <input type="checkbox" id="incident-active-input" class="w-4 h-4 cursor-pointer" checked />
                <label for="incident-active-input" class="text-xs cursor-pointer m-0">Active (Display on main status page)</label>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" onclick="closeIncidentModal()" class="shad-btn">Cancel</button>
                <button type="submit" class="shad-btn shad-btn-primary">Save Banner</button>
              </div>
            </form>
          </div>
        </div>

        <script>{`
          const BASE = window.location.origin;
          const ADMIN_PATH = '${adminPath}';

          const moonSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
          const sunSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

          function initTheme() {
            const saved = localStorage.getItem('admin_theme') || 'system';
            setTheme(saved);
          }

          function toggleTheme() {
            const current = document.documentElement.getAttribute('data-theme');
            let next = 'dark';
            if (current === 'dark') next = 'light';
            else if (current === 'light') next = 'dark';
            else {
              next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
            }
            localStorage.setItem('admin_theme', next);
            setTheme(next);
          }

          function setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            const iconSvg = document.getElementById('theme-icon-svg');
            const text = document.getElementById('theme-text');
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

            if (isDark) {
              if (iconSvg) iconSvg.innerHTML = sunSvg;
              if (text) text.textContent = 'Light Mode';
            } else {
              if (iconSvg) iconSvg.innerHTML = moonSvg;
              if (text) text.textContent = 'Dark Mode';
            }
          }

          const tabTitles = {
            services: 'Monitored Services',
            test: 'Instant Monitor Tester',
            notifications: 'Notification Integrations',
            brand: 'Brand Settings & Custom Code',
            security: 'Security & 2FA Authentication',
            templates: 'Message Templates',
            incidents: 'Incident Banners',
            backup: 'Backup & Restore',
          };

          function switchTab(tabName, event) {
            document.querySelectorAll('.cf-sidebar-item').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            if (event && event.currentTarget) {
              event.currentTarget.classList.add('active');
            }

            const breadcrumb = document.getElementById('breadcrumb-title');
            if (breadcrumb && tabTitles[tabName]) {
              breadcrumb.textContent = tabTitles[tabName];
            }

            document.getElementById('tab-' + tabName).classList.add('active');

            if (tabName === 'services') loadServices();
            if (tabName === 'notifications') loadNotifs();
            if (tabName === 'brand' || tabName === 'templates' || tabName === 'backup') loadSettings();
            if (tabName === 'security') load2FAStatus();
            if (tabName === 'incidents') loadIncidents();
          }

          async function load2FAStatus() {
            try {
              const res = await fetch(BASE + '/api/admin/2fa/setup');
              if (res.ok) {
                const data = await res.json();
                const badge = document.getElementById('2fa-status-badge');
                const setupBtn = document.getElementById('2fa-setup-btn');
                const disableBtn = document.getElementById('2fa-disable-btn');

                if (data.enabled) {
                  badge.className = 'text-sm font-bold text-emerald-500 flex items-center gap-1.5';
                  badge.textContent = '✓ Enabled & Active';
                  setupBtn.style.display = 'none';
                  disableBtn.style.display = 'inline-flex';
                } else {
                  badge.className = 'text-sm font-bold text-amber-500 flex items-center gap-1.5';
                  badge.textContent = '⚠ Disabled (Not Configured)';
                  setupBtn.style.display = 'inline-flex';
                  disableBtn.style.display = 'none';
                }
              }
            } catch (e) { console.error(e); }
          }

          async function start2FASetup() {
            try {
              const res = await fetch(BASE + '/api/admin/2fa/setup');
              if (res.ok) {
                const data = await res.json();
                document.getElementById('2fa-qr-img').src = data.qrCodeUrl;
                document.getElementById('2fa-secret-key').value = data.secret;
                document.getElementById('2fa-confirm-code').value = '';
                document.getElementById('2fa-modal-error').classList.add('hidden');
                document.getElementById('2fa-setup-modal').classList.add('open');
              }
            } catch (e) {
              alert('Error generating 2FA setup QR code');
            }
          }

          function close2FAModal() {
            document.getElementById('2fa-setup-modal').classList.remove('open');
          }

          function copy2FASecret() {
            const key = document.getElementById('2fa-secret-key').value;
            navigator.clipboard.writeText(key);
            alert('Secret key copied to clipboard!');
          }

          async function confirmEnable2FA(e) {
            e.preventDefault();
            const secret = document.getElementById('2fa-secret-key').value;
            const code = document.getElementById('2fa-confirm-code').value;
            const errBox = document.getElementById('2fa-modal-error');
            const submitBtn = document.getElementById('2fa-enable-submit-btn');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Activating...';
            errBox.classList.add('hidden');

            try {
              const res = await fetch(BASE + '/api/admin/2fa/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret, code }),
              });

              const data = await res.json();
              submitBtn.disabled = false;
              submitBtn.textContent = 'Activate 2FA';

              if (res.ok && data.success) {
                close2FAModal();
                alert('✓ Two-Factor Authentication (2FA) is now active on your admin account!');
                load2FAStatus();
              } else {
                errBox.textContent = data.error || 'Invalid 6-digit code';
                errBox.classList.remove('hidden');
              }
            } catch (err) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Activate 2FA';
              errBox.textContent = 'Connection error';
              errBox.classList.remove('hidden');
            }
          }

          async function disable2FA() {
            const code = prompt('To disable Two-Factor Authentication, enter your current 6-digit Authenticator code:');
            if (!code) return;

            try {
              const res = await fetch(BASE + '/api/admin/2fa/disable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
              });

              const data = await res.json();
              if (res.ok && data.success) {
                alert('✓ 2FA has been disabled.');
                load2FAStatus();
              } else {
                alert('✗ ' + (data.error || 'Invalid code'));
              }
            } catch (e) {
              alert('Error disabling 2FA');
            }
          }

          function toggleEngineOptions() {
            const engine = document.getElementById('service-checkType').value;
            const gpTypeGroup = document.getElementById('gp-type-group');
            const gpType = document.getElementById('service-globalpingType').value;
            const regionGroup = document.getElementById('region-group');
            const targetGroup = document.getElementById('target-url-group');
            const targetLabel = document.getElementById('target-label');
            const targetInput = document.getElementById('service-url');
            const httpOptionsGroup = document.getElementById('http-options-group');
            const advancedHttpGroup = document.getElementById('advanced-http-group');
            const expectedInput = document.getElementById('service-expected');
            const heartbeatGroup = document.getElementById('heartbeat-info-group');
            const heartbeatIntervalGroup = document.getElementById('heartbeat-interval-group');
            const timeoutGroup = document.getElementById('timeout-group');

            if (engine === 'heartbeat') {
              targetGroup.style.display = 'none';
              gpTypeGroup.style.display = 'none';
              regionGroup.style.display = 'none';
              httpOptionsGroup.style.display = 'none';
              advancedHttpGroup.style.display = 'none';
              timeoutGroup.style.display = 'none';
              heartbeatGroup.style.display = 'block';
              heartbeatIntervalGroup.style.display = 'block';
              targetInput.removeAttribute('required');
              expectedInput.removeAttribute('required');

              const token = document.getElementById('service-id').value || 'TOKEN';
              document.getElementById('heartbeat-url-display').textContent = BASE + '/api/heartbeat/' + token;
            } else if (engine === 'globalping') {
              targetGroup.style.display = 'block';
              targetInput.setAttribute('required', 'true');
              gpTypeGroup.style.display = 'block';
              regionGroup.style.display = 'block';
              heartbeatGroup.style.display = 'none';
              heartbeatIntervalGroup.style.display = 'none';
              timeoutGroup.style.display = 'block';

              if (gpType === 'ping') {
                targetLabel.textContent = 'Target Hostname or IP Address';
                targetInput.placeholder = 'api.example.com or 8.8.8.8';
                httpOptionsGroup.style.display = 'none';
                advancedHttpGroup.style.display = 'none';
                expectedInput.removeAttribute('required');
              } else {
                targetLabel.textContent = 'Target URL or Domain';
                targetInput.placeholder = 'https://api.example.com/health';
                httpOptionsGroup.style.display = 'grid';
                advancedHttpGroup.style.display = 'grid';
              }
            } else {
              targetGroup.style.display = 'block';
              targetInput.setAttribute('required', 'true');
              gpTypeGroup.style.display = 'none';
              regionGroup.style.display = 'none';
              heartbeatGroup.style.display = 'none';
              heartbeatIntervalGroup.style.display = 'none';
              timeoutGroup.style.display = 'block';
              targetLabel.textContent = 'Target URL';
              targetInput.placeholder = 'https://api.example.com/health';
              httpOptionsGroup.style.display = 'grid';
              advancedHttpGroup.style.display = 'grid';
            }
          }

          function toggleTestEngineOptions() {
            const engine = document.getElementById('test-checkType').value;
            const gpTypeGroup = document.getElementById('test-gp-type-group');
            const gpType = document.getElementById('test-globalpingType').value;
            const regionGroup = document.getElementById('test-region-group');
            const targetLabel = document.getElementById('test-target-label');
            const targetInput = document.getElementById('test-url');
            const httpOptionsGroup = document.getElementById('test-http-options-group');

            if (engine === 'globalping') {
              gpTypeGroup.style.display = 'block';
              regionGroup.style.display = 'block';

              if (gpType === 'ping') {
                targetLabel.textContent = 'Target Hostname or IP Address';
                targetInput.placeholder = 'api.example.com or 8.8.8.8';
                httpOptionsGroup.style.display = 'none';
              } else {
                targetLabel.textContent = 'Target URL or Domain';
                targetInput.placeholder = 'https://api.example.com/health';
                httpOptionsGroup.style.display = 'grid';
              }
            } else {
              gpTypeGroup.style.display = 'none';
              regionGroup.style.display = 'none';
              targetLabel.textContent = 'Target URL';
              targetInput.placeholder = 'https://api.example.com/health';
              httpOptionsGroup.style.display = 'grid';
            }
          }

          function toggleAutoBackupIntervalView() {
            const enabled = document.getElementById('setting-autoBackupTelegram').checked;
            const group = document.getElementById('auto-backup-interval-group');
            if (group) group.style.display = enabled ? 'grid' : 'none';
          }

          async function runStandaloneTest(e) {
            e.preventDefault();
            const runBtn = document.getElementById('test-run-btn');
            const container = document.getElementById('test-results-container');
            const card = document.getElementById('test-results-card');

            runBtn.disabled = true;
            runBtn.textContent = '⚡️ Testing target...';
            container.classList.remove('hidden');
            card.className = 'p-4 rounded-lg border bg-muted text-xs';
            card.innerHTML = 'Executing measurement... Please wait.';

            try {
              const expVal = parseInt(document.getElementById('test-expected').value, 10);
              const timeoutVal = parseInt(document.getElementById('test-timeout').value, 10);

              const payload = {
                url: document.getElementById('test-url').value,
                method: document.getElementById('test-method').value || 'GET',
                expectedStatus: !isNaN(expVal) && expVal > 0 ? expVal : 200,
                timeout: !isNaN(timeoutVal) && timeoutVal > 0 ? timeoutVal : 10000,
                checkType: document.getElementById('test-checkType').value,
                globalpingType: document.getElementById('test-globalpingType').value,
                checkRegions: document.getElementById('test-checkRegions').value,
              };

              const res = await fetch(BASE + '/api/admin/test-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const data = await res.json();
              runBtn.disabled = false;
              runBtn.textContent = '⚡️ Run Instant Test';

              if (res.ok && data.success) {
                const isOk = data.isHealthy;
                card.className = \`p-5 rounded-lg border \${isOk ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}\`;
                card.innerHTML = \`
                  <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <div class="font-bold text-sm \${isOk ? 'text-[var(--success)]' : 'text-[var(--danger)]'}">
                      \${isOk ? '✓ Target Status: Operational / Healthy' : '✗ Target Status: Outage / Failed'}
                    </div>
                    <div class="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                      Latency: \${data.responseTime}ms
                    </div>
                  </div>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mb-2 text-[hsl(var(--muted-foreground))]">
                    <div>HTTP Status: <b>\${data.statusCode || 'N/A'}</b></div>
                    <div>Region / Node: <b>\${data.region || 'Direct'}</b></div>
                    <div>Check Engine: <b>\${payload.checkType.toUpperCase()} (\${payload.globalpingType.toUpperCase()})</b></div>
                  </div>
                  \${data.error ? \`<div class="mt-2 text-xs p-2 rounded bg-red-500/20 text-[var(--danger)] font-mono">\${data.error}</div>\` : ''}
                \`;
              } else {
                card.className = 'p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-xs text-[var(--danger)]';
                card.textContent = 'Test failed: ' + (data.error || 'Unknown error');
              }
            } catch (err) {
              runBtn.disabled = false;
              runBtn.textContent = '⚡️ Run Instant Test';
              card.className = 'p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-xs text-[var(--danger)]';
              card.textContent = 'Test error: ' + (err.message || 'Connection error');
            }
          }

          async function testModalService() {
            const btn = document.getElementById('modal-test-btn');
            const resultBox = document.getElementById('modal-test-result');
            const target = document.getElementById('service-url').value;

            if (!target) {
              alert('Please enter a Target URL or Host first');
              return;
            }

            btn.disabled = true;
            btn.textContent = 'Testing...';
            resultBox.classList.remove('hidden');
            resultBox.className = 'mb-4 p-3 rounded text-xs bg-muted';
            resultBox.textContent = 'Running test check...';

            try {
              const expVal = parseInt(document.getElementById('service-expected').value, 10);
              const timeoutVal = parseInt(document.getElementById('service-timeout').value, 10);

              const payload = {
                url: target,
                method: document.getElementById('service-method').value || 'GET',
                expectedStatus: !isNaN(expVal) && expVal > 0 ? expVal : 200,
                timeout: !isNaN(timeoutVal) && timeoutVal > 0 ? timeoutVal : 10000,
                checkType: document.getElementById('service-checkType').value,
                globalpingType: document.getElementById('service-globalpingType').value,
                checkRegions: document.getElementById('service-checkRegions').value,
              };

              const res = await fetch(BASE + '/api/admin/test-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
              });

              const data = await res.json();
              btn.disabled = false;
              btn.textContent = '⚡️ Test Before Save';

              if (res.ok && data.success) {
                const isOk = data.isHealthy;
                resultBox.className = \`mb-4 p-3 rounded text-xs \${isOk ? 'bg-emerald-500/10 text-[var(--success)] border border-emerald-500/30' : 'bg-red-500/10 text-[var(--danger)] border border-red-500/30'}\`;
                resultBox.innerHTML = \`
                  <b>\${isOk ? '✓ Test Passed!' : '✗ Test Failed!'}</b> Latency: \${data.responseTime}ms | Status Code: \${data.statusCode || 'N/A'} | Region: \${data.region || 'Direct'}
                  \${data.error ? \`<div class="mt-1 text-[11px] font-mono">\${data.error}</div>\` : ''}
                \`;
              } else {
                resultBox.className = 'mb-4 p-3 rounded text-xs bg-red-500/10 text-[var(--danger)]';
                resultBox.textContent = 'Test failed: ' + (data.error || 'Unknown error');
              }
            } catch (err) {
              btn.disabled = false;
              btn.textContent = '⚡️ Test Before Save';
              resultBox.className = 'mb-4 p-3 rounded text-xs bg-red-500/10 text-[var(--danger)]';
              resultBox.textContent = 'Test error: ' + (err.message || 'Connection failure');
            }
          }

          async function loadServices() {
            try {
              const res = await fetch(BASE + '/api/services');
              const services = await res.json();
              const container = document.getElementById('services-list');

              if (!services || services.length === 0) {
                container.innerHTML = '<div class="shad-card p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">No services configured.</div>';
                return;
              }

              container.innerHTML = services.map(s => \`
                <div class="shad-card p-5 mb-3">
                  <div class="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-base font-semibold m-0">\${s.name}</h3>
                        \${s.groupName ? \`<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-muted text-[hsl(var(--muted-foreground))]">\${s.groupName}</span>\` : ''}
                      </div>
                      <p class="text-xs text-[hsl(var(--muted-foreground))] m-0 mb-2 break-all">
                        \${s.checkType === 'heartbeat' ? ('Heartbeat Token: ' + (s.heartbeatToken || 'N/A')) : (s.url || s.displayUrl || '(Target Hidden)')}
                      </p>
                      <div class="text-[11px] text-[hsl(var(--muted-foreground))] flex flex-wrap gap-x-3 gap-y-1">
                        <span>Engine: <b>\${(s.checkType || 'direct').toUpperCase()}</b></span>
                        <span>Max Retries Threshold: <b>\${s.maxRetries || 1}</b></span>
                        \${s.consecutiveFails ? \`<span class="text-amber-500 font-semibold">Consecutive Fails: \${s.consecutiveFails}</span>\` : ''}
                        \${s.keyword ? \`<span>Keyword: <b>"\${s.keyword}"</b></span>\` : ''}
                        \${s.headers ? \`<span>Custom Headers: <b>Yes</b></span>\` : ''}
                      </div>
                    </div>
                    <div class="flex gap-2">
                      <button onclick='editService(\${JSON.stringify(s).replace(/'/g, "\\\\'")})' class="shad-btn">Edit</button>
                      <button onclick="deleteService('\${s.id}')" class="shad-btn shad-btn-danger">Delete</button>
                    </div>
                  </div>
                </div>
              \`).join('');
            } catch (e) {
              console.error(e);
            }
          }

          function openServiceModal() {
            document.getElementById('service-id').value = '';
            document.getElementById('service-form').reset();
            document.getElementById('service-maxRetries').value = 1;
            document.getElementById('modal-test-result').classList.add('hidden');
            document.getElementById('service-modal-title').textContent = 'Add Service';
            toggleEngineOptions();
            document.getElementById('service-modal').classList.add('open');
          }

          function closeServiceModal() {
            document.getElementById('service-modal').classList.remove('open');
          }

          function editService(s) {
            document.getElementById('service-id').value = s.id;
            document.getElementById('service-name').value = s.name;
            document.getElementById('service-groupName').value = s.groupName || '';
            document.getElementById('service-url').value = s.url || s.displayUrl || '';
            document.getElementById('service-method').value = s.method || 'GET';
            document.getElementById('service-expected').value = s.expectedStatus || 200;
            document.getElementById('service-timeout').value = s.timeout || 10000;
            document.getElementById('service-maxRetries').value = s.maxRetries || 1;
            document.getElementById('service-checkType').value = s.checkType || 'direct';
            document.getElementById('service-globalpingType').value = s.globalpingType || 'http';
            document.getElementById('service-keyword').value = s.keyword || '';
            document.getElementById('service-headers').value = typeof s.headers === 'object' && s.headers ? JSON.stringify(s.headers) : (s.headers || '');
            document.getElementById('service-heartbeatInterval').value = s.heartbeatInterval || 300;
            document.getElementById('service-checkRegions').value = Array.isArray(s.checkRegions) ? s.checkRegions.join(', ') : (s.checkRegions || '');
            document.getElementById('service-showUrl').checked = Boolean(s.showUrl);
            document.getElementById('modal-test-result').classList.add('hidden');
            toggleEngineOptions();
            document.getElementById('service-modal-title').textContent = 'Edit Service';
            document.getElementById('service-modal').classList.add('open');
          }

          async function saveService(e) {
            e.preventDefault();
            const id = document.getElementById('service-id').value;
            const expVal = parseInt(document.getElementById('service-expected').value, 10);
            const expectedStatus = !isNaN(expVal) && expVal > 0 ? expVal : 200;

            const timeVal = parseInt(document.getElementById('service-timeout').value, 10);
            const timeout = !isNaN(timeVal) && timeVal > 0 ? timeVal : 10000;

            const retriesVal = parseInt(document.getElementById('service-maxRetries').value, 10);
            const maxRetries = !isNaN(retriesVal) && retriesVal > 0 ? retriesVal : 1;

            const payload = {
              name: document.getElementById('service-name').value,
              groupName: document.getElementById('service-groupName').value,
              url: document.getElementById('service-url').value || (BASE + '/api/heartbeat/placeholder'),
              method: document.getElementById('service-method').value || 'GET',
              expectedStatus: expectedStatus,
              timeout: timeout,
              maxRetries: maxRetries,
              checkType: document.getElementById('service-checkType').value,
              globalpingType: document.getElementById('service-globalpingType').value,
              keyword: document.getElementById('service-keyword').value,
              headers: document.getElementById('service-headers').value,
              heartbeatInterval: parseInt(document.getElementById('service-heartbeatInterval').value, 10) || 300,
              checkRegions: document.getElementById('service-checkRegions').value,
              showUrl: document.getElementById('service-showUrl').checked,
            };

            const url = id ? (BASE + '/api/services/' + id) : (BASE + '/api/services');
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              closeServiceModal();
              loadServices();
            } else {
              let errDetail = '';
              try {
                const data = await res.json();
                if (data && data.error) errDetail = ': ' + data.error;
              } catch {}
              alert('Error saving service' + errDetail);
            }
          }

          async function deleteService(id) {
            if (!confirm('Are you sure you want to delete this service?')) return;
            await fetch(BASE + '/api/services/' + id, { method: 'DELETE' });
            loadServices();
          }

          async function loadNotifs() {
            try {
              const res = await fetch(BASE + '/api/notifications');
              const notifs = await res.json();
              const container = document.getElementById('notifs-list');

              if (!notifs || notifs.length === 0) {
                container.innerHTML = '<div class="shad-card p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">No notification integrations.</div>';
                return;
              }

              container.innerHTML = notifs.map(n => \`
                <div class="shad-card p-5 mb-3">
                  <div class="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h3 class="text-base font-semibold m-0 mb-1 capitalize">\${n.type}</h3>
                      <div class="text-xs text-[hsl(var(--muted-foreground))]">
                        \${n.type === 'telegram' ? ('Alert Chat: ' + (n.config.chatId || 'N/A') + ' | Backup Chat: ' + (n.config.backupChatId || 'N/A')) : (n.config.webhookUrl || 'Configured')}
                      </div>
                    </div>
                    <div class="flex gap-2 items-center">
                      <button onclick='editNotif(\${JSON.stringify(n).replace(/'/g, "\\\\'")})' class="shad-btn">Edit</button>
                      <button onclick="deleteNotif('\${n.id}')" class="shad-btn shad-btn-danger">Delete</button>
                    </div>
                  </div>
                </div>
              \`).join('');
            } catch (e) { console.error(e); }
          }

          function openNotifModal() {
            document.getElementById('notif-id').value = '';
            document.getElementById('notif-form').reset();
            toggleNotifFields();
            document.getElementById('notif-modal').classList.add('open');
          }
          function closeNotifModal() { document.getElementById('notif-modal').classList.remove('open'); }

          function toggleNotifFields() {
            const type = document.getElementById('notif-type').value;
            document.getElementById('telegram-fields').style.display = type === 'telegram' ? 'block' : 'none';
            document.getElementById('slack-fields').style.display = type === 'slack' ? 'block' : 'none';
            document.getElementById('discord-fields').style.display = type === 'discord' ? 'block' : 'none';
            document.getElementById('webhook-fields').style.display = type === 'webhook' ? 'block' : 'none';
          }

          function editNotif(n) {
            document.getElementById('notif-id').value = n.id;
            document.getElementById('notif-type').value = n.type;
            if (n.type === 'telegram') {
              document.getElementById('notif-botToken').value = n.config.botToken || '';
              document.getElementById('notif-chatId').value = n.config.chatId || '';
              document.getElementById('notif-backupChatId').value = n.config.backupChatId || '';
            } else if (n.type === 'discord') {
              document.getElementById('notif-discordWebhookUrl').value = n.config.webhookUrl || '';
            } else if (n.type === 'webhook') {
              document.getElementById('notif-customWebhookUrl').value = n.config.webhookUrl || '';
              document.getElementById('notif-secretHeader').value = n.config.secretHeader || '';
            } else {
              document.getElementById('notif-webhookUrl').value = n.config.webhookUrl || '';
            }
            toggleNotifFields();
            document.getElementById('notif-modal').classList.add('open');
          }

          async function saveNotif(e) {
            e.preventDefault();
            const id = document.getElementById('notif-id').value;
            const type = document.getElementById('notif-type').value;

            let config = {};
            if (type === 'telegram') {
              config = {
                botToken: document.getElementById('notif-botToken').value,
                chatId: document.getElementById('notif-chatId').value,
                backupChatId: document.getElementById('notif-backupChatId').value,
              };
            } else if (type === 'discord') {
              config = { webhookUrl: document.getElementById('notif-discordWebhookUrl').value };
            } else if (type === 'webhook') {
              config = {
                webhookUrl: document.getElementById('notif-customWebhookUrl').value,
                secretHeader: document.getElementById('notif-secretHeader').value,
              };
            } else {
              config = { webhookUrl: document.getElementById('notif-webhookUrl').value };
            }

            const url = id ? (BASE + '/api/notifications/' + id) : (BASE + '/api/notifications');
            const method = id ? 'PATCH' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, config }),
            });

            if (res.ok) {
              closeNotifModal();
              loadNotifs();
            } else { alert('Error saving notification'); }
          }

          async function deleteNotif(id) {
            if (!confirm('Delete integration?')) return;
            await fetch(BASE + '/api/notifications/' + id, { method: 'DELETE' });
            loadNotifs();
          }

          async function loadSettings() {
            try {
              const res = await fetch(BASE + '/api/admin/settings');
              if (res.ok) {
                const s = await res.json();
                document.getElementById('setting-brandName').value = s.brandName || '';
                document.getElementById('setting-brandLogoUrl').value = s.brandLogoUrl || '';
                document.getElementById('setting-downTemplate').value = s.downTemplate || '';
                document.getElementById('setting-recoveryTemplate').value = s.recoveryTemplate || '';
                document.getElementById('setting-customCss').value = s.customCss || '';
                document.getElementById('setting-customJs').value = s.customJs || '';

                const autoBackupToggle = document.getElementById('setting-autoBackupTelegram');
                if (autoBackupToggle) {
                  autoBackupToggle.checked = Boolean(s.autoBackupTelegram);
                }
                const autoBackupIntervalSelect = document.getElementById('setting-autoBackupIntervalDays');
                if (autoBackupIntervalSelect) {
                  autoBackupIntervalSelect.value = String(s.autoBackupIntervalDays !== undefined ? s.autoBackupIntervalDays : '1');
                }
                const autoBackupBotTokenInput = document.getElementById('setting-autoBackupBotToken');
                if (autoBackupBotTokenInput) {
                  autoBackupBotTokenInput.value = s.autoBackupBotToken || '';
                }
                const autoBackupChatIdInput = document.getElementById('setting-autoBackupChatId');
                if (autoBackupChatIdInput) {
                  autoBackupChatIdInput.value = s.autoBackupChatId || '';
                }
                const lastBackupStatusBox = document.getElementById('auto-backup-last-status');
                if (lastBackupStatusBox) {
                  lastBackupStatusBox.textContent = s.lastBackupAt ? ('Last auto-backup sent: ' + new Date(s.lastBackupAt).toLocaleString()) : 'Never sent yet';
                }
                toggleAutoBackupIntervalView();
              }
            } catch (e) { console.error(e); }
          }

          async function saveBrandSettings(e) {
            e.preventDefault();
            const body = {
              brandName: document.getElementById('setting-brandName').value,
              brandLogoUrl: document.getElementById('setting-brandLogoUrl').value,
            };
            const res = await fetch(BASE + '/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (res.ok) alert('Brand settings updated!');
            else alert('Failed to update brand settings');
          }

          async function saveCustomCodeSettings(e) {
            e.preventDefault();
            const body = {
              customCss: document.getElementById('setting-customCss').value,
              customJs: document.getElementById('setting-customJs').value,
            };
            const res = await fetch(BASE + '/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (res.ok) alert('✓ Custom CSS & JS updated!');
            else alert('✗ Failed to update custom CSS/JS');
          }

          async function saveTemplateSettings(e) {
            e.preventDefault();
            const body = {
              downTemplate: document.getElementById('setting-downTemplate').value,
              recoveryTemplate: document.getElementById('setting-recoveryTemplate').value,
            };
            const res = await fetch(BASE + '/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (res.ok) alert('Message templates updated!');
            else alert('Failed to update message templates');
          }

          async function saveAutoBackupSettings(e) {
            e.preventDefault();
            const body = {
              autoBackupTelegram: document.getElementById('setting-autoBackupTelegram').checked,
              autoBackupIntervalDays: parseFloat(document.getElementById('setting-autoBackupIntervalDays').value) || 1,
              autoBackupBotToken: document.getElementById('setting-autoBackupBotToken').value,
              autoBackupChatId: document.getElementById('setting-autoBackupChatId').value,
            };
            const res = await fetch(BASE + '/api/admin/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body),
            });
            if (res.ok) alert('✓ Scheduled automatic Telegram backup settings updated!');
            else alert('✗ Failed to update automatic backup settings');
          }

          async function loadIncidents() {
            try {
              const res = await fetch(BASE + '/api/admin/incidents');
              const incidents = await res.json();
              const container = document.getElementById('incidents-list');

              if (!incidents || incidents.length === 0) {
                container.innerHTML = '<div class="shad-card p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">No incident announcements created.</div>';
                return;
              }

              container.innerHTML = incidents.map(inc => \`
                <div class="shad-card p-5 mb-3">
                  <div class="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <h3 class="text-base font-semibold m-0 mb-1">\${inc.title} <span class="text-xs text-[hsl(var(--muted-foreground))]">(\${inc.severity.toUpperCase()})</span></h3>
                      <p class="text-sm m-0 mb-2 text-[hsl(var(--muted-foreground))]">\${inc.message}</p>
                      <div class="text-xs text-[hsl(var(--muted-foreground))]">Active: <b>\${inc.isActive ? 'Yes' : 'No'}</b> • Created: \${new Date(inc.createdAt).toLocaleString()}</div>
                    </div>
                    <div class="flex gap-2">
                      <button onclick='editIncident(\${JSON.stringify(inc).replace(/'/g, "\\\\'")})' class="shad-btn">Edit</button>
                      <button onclick="deleteIncident('\${inc.id}')" class="shad-btn shad-btn-danger">Delete</button>
                    </div>
                  </div>
                </div>
              \`).join('');
            } catch (e) { console.error(e); }
          }

          function openIncidentModal() {
            document.getElementById('incident-id').value = '';
            document.getElementById('incident-form').reset();
            document.getElementById('incident-modal').classList.add('open');
          }
          function closeIncidentModal() { document.getElementById('incident-modal').classList.remove('open'); }

          function editIncident(inc) {
            document.getElementById('incident-id').value = inc.id;
            document.getElementById('incident-title-input').value = inc.title;
            document.getElementById('incident-message-input').value = inc.message;
            document.getElementById('incident-severity-input').value = inc.severity;
            document.getElementById('incident-active-input').checked = Boolean(inc.isActive);
            document.getElementById('incident-modal').classList.add('open');
          }

          async function saveIncident(e) {
            e.preventDefault();
            const id = document.getElementById('incident-id').value;
            const payload = {
              title: document.getElementById('incident-title-input').value,
              message: document.getElementById('incident-message-input').value,
              severity: document.getElementById('incident-severity-input').value,
              isActive: document.getElementById('incident-active-input').checked,
            };

            const url = id ? (BASE + '/api/incidents/' + id) : (BASE + '/api/incidents');
            const method = id ? 'PUT' : 'POST';

            const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              closeIncidentModal();
              loadIncidents();
            } else alert('Error saving incident');
          }

          async function deleteIncident(id) {
            if (!confirm('Delete incident announcement?')) return;
            await fetch(BASE + '/api/incidents/' + id, { method: 'DELETE' });
            loadIncidents();
          }

          async function sendBackupToTelegram() {
            if (!confirm('Send current system JSON backup file to your Telegram backup chat?')) return;
            try {
              const res = await fetch(BASE + '/api/admin/backup/telegram', { method: 'POST' });
              const data = await res.json();
              if (res.ok && data.success) {
                alert('✓ ' + data.message);
              } else {
                alert('✗ ' + (data.error || 'Failed to send backup to Telegram'));
              }
            } catch (e) {
              alert('Error sending backup to Telegram');
            }
          }

          async function restoreFromBackup() {
            const input = document.getElementById('restore-file-input');
            if (!input.files || input.files.length === 0) {
              alert('Please select a JSON backup file to restore');
              return;
            }

            if (!confirm('WARNING: Restoring backup will overwrite existing settings and services. Continue?')) return;

            try {
              const text = await input.files[0].text();
              const json = JSON.parse(text);

              const res = await fetch(BASE + '/api/admin/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(json),
              });

              if (res.ok) {
                alert('✓ System backup restored successfully!');
                location.reload();
              } else {
                const data = await res.json();
                alert('✗ Restore failed: ' + (data.error || 'Invalid file format'));
              }
            } catch (e) {
              alert('Error parsing or uploading backup file');
            }
          }

          function logout() {
            document.cookie = 'auth=;path=/;max-age=0';
            location.href = ADMIN_PATH + '/login';
          }

          initTheme();
          loadServices();
        `}</script>
      </body>
    </html>
  );
}
