import { Html } from '@elysiajs/html';

export function MonitorOverview({ isAdmin = false, adminPath = '/manage-x7k9' }: { isAdmin?: boolean; adminPath?: string }) {
  return (
    <html lang="en" data-theme="system">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Status Page</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
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
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
          }

          [data-theme="dark"] {
            --background: 240 5% 8%; /* #121215 Neutral Dark Charcoal */
            --foreground: 240 5% 96%; /* #f4f4f5 High Contrast White */
            --card: 240 4% 12%; /* #1c1c20 Neutral Gray Card */
            --card-foreground: 240 5% 96%;
            --muted: 240 4% 18%; /* #29292e Charcoal Hover/Fill */
            --muted-foreground: 240 5% 72%; /* #b5b5bc Crisp Light Gray */
            --border: 240 4% 22%; /* #333339 Charcoal Border */
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
            }
          }

          * { box-sizing: border-box; }
          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            margin: 0;
            padding: 0;
            transition: background-color 0.2s ease, color 0.2s ease;
          }

          .shad-card {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
          }

          .shad-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            padding: 0.5rem 1rem;
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

          .shad-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid transparent;
          }

          .shad-badge-success {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border-color: rgba(16, 185, 129, 0.2);
          }
          .shad-badge-warning {
            background-color: rgba(245, 158, 11, 0.1);
            color: var(--warning);
            border-color: rgba(245, 158, 11, 0.2);
          }
          .shad-badge-danger {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border-color: rgba(239, 68, 68, 0.2);
          }

          .timeline-bar {
            flex: 1;
            height: 30px;
            border-radius: 4px;
            transition: all 0.15s ease;
            cursor: pointer;
          }
          .timeline-bar:hover { opacity: 0.8; transform: scaleY(1.08); }

          @keyframes livePulseRing {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .pulse-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            animation: livePulseRing 1.8s ease-in-out infinite;
          }
        `}</style>
        <style id="custom-css-container"></style>
      </head>
      <body>
        <div class="max-w-5xl mx-auto px-4 py-10">
          {/* Header */}
          <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div class="flex items-center gap-3.5" id="brand-header">
              <img id="brand-logo-img" class="h-10 max-w-[140px] object-contain rounded-lg" style="display:none;" alt="Brand Logo" />
              <h1 id="brand-title" class="text-2xl font-bold tracking-tight">MonitorFlare</h1>
            </div>
            <div>
              <button class="shad-btn" onclick="toggleTheme()">
                <span id="theme-icon-svg" class="inline-flex items-center"></span>
                <span id="theme-text" class="ml-1.5 text-xs font-medium">Dark Mode</span>
              </button>
            </div>
          </div>

          {/* Active Incidents Banner */}
          <div id="incidents-list" class="mb-8 flex flex-col gap-3"></div>

          {/* Overall Status Box */}
          <div class="shad-card p-5 mb-8 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span id="overall-dot" class="pulse-dot" style="background-color: var(--success);"></span>
              <span id="overall-text" class="text-base font-semibold">All Systems Operational</span>
            </div>
            <div class="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Updated <span id="last-updated-text">just now</span></span>
            </div>
          </div>

          {/* Service List with Category Grouping */}
          <div id="services-container">
            <div class="text-center py-16 text-sm text-[hsl(var(--muted-foreground))]">Loading status data...</div>
          </div>
        </div>

        <script>{`
          const BASE = window.location.origin;

          const moonSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
          const sunSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

          function initTheme() {
            const saved = localStorage.getItem('theme') || 'system';
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
            localStorage.setItem('theme', next);
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

          function formatRelativeTime(dateStr) {
            if (!dateStr) return 'Never checked';
            const date = new Date(dateStr);
            const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
            if (diffSec < 30) return 'just now';
            if (diffSec < 60) return \`\${diffSec}s ago\`;
            const diffMin = Math.floor(diffSec / 60);
            if (diffMin < 60) return \`\${diffMin} minute\${diffMin > 1 ? 's' : ''} ago\`;
            const diffHour = Math.floor(diffMin / 60);
            return \`\${diffHour} hour\${diffHour > 1 ? 's' : ''} ago\`;
          }

          async function fetchSettings() {
            try {
              const res = await fetch(BASE + '/api/settings');
              if (res.ok) {
                const data = await res.json();
                if (data.brandName) {
                  document.getElementById('brand-title').textContent = data.brandName;
                  document.title = data.brandName + ' - Status';
                }
                const logoImg = document.getElementById('brand-logo-img');
                if (data.brandLogoUrl) {
                  logoImg.src = data.brandLogoUrl;
                  logoImg.style.display = 'block';
                } else {
                  logoImg.style.display = 'none';
                }
                if (data.brandColor) {
                  document.documentElement.style.setProperty('--brand-color', data.brandColor);
                }
                if (data.customCss) {
                  document.getElementById('custom-css-container').textContent = data.customCss;
                }
                if (data.customJs) {
                  try { eval(data.customJs); } catch (err) { console.error('Custom JS error:', err); }
                }
              }
            } catch (e) {
              console.error('Settings fetch error:', e);
            }
          }

          async function fetchIncidents() {
            try {
              const res = await fetch(BASE + '/api/incidents');
              if (!res.ok) return;
              const incidents = await res.json();
              const container = document.getElementById('incidents-list');

              if (!incidents || incidents.length === 0) {
                container.innerHTML = '';
                return;
              }

              container.innerHTML = incidents.map(inc => \`
                <div class="shad-card p-4 border-l-4 \${inc.severity === 'critical' ? 'border-l-red-500' : inc.severity === 'info' ? 'border-l-indigo-500' : 'border-l-amber-500'}">
                  <div class="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span class="text-xs uppercase px-2 py-0.5 rounded font-bold bg-muted">\${inc.severity || 'Notice'}</span>
                    \${inc.title}
                  </div>
                  <p class="text-xs text-[hsl(var(--muted-foreground))] m-0 leading-relaxed">\${inc.message}</p>
                </div>
              \`).join('');
            } catch (e) {
              console.error('Incidents fetch error:', e);
            }
          }

          async function loadData() {
            try {
              await fetchSettings();
              await fetchIncidents();

              const res = await fetch(BASE + '/api/services');
              const services = await res.json();
              const container = document.getElementById('services-container');

              document.getElementById('last-updated-text').textContent = formatRelativeTime(new Date().toISOString());

              if (!services || services.length === 0) {
                container.innerHTML = '<div class="shad-card p-12 text-center text-sm text-[hsl(var(--muted-foreground))]">No monitored services configured yet.</div>';
                return;
              }

              const anyDown = services.some(s => s.lastStatus === 'unhealthy');

              if (anyDown) {
                document.getElementById('overall-dot').style.backgroundColor = 'var(--danger)';
                document.getElementById('overall-text').textContent = 'Some Systems Experiencing Outage';
              } else {
                document.getElementById('overall-dot').style.backgroundColor = 'var(--success)';
                document.getElementById('overall-text').textContent = 'All Systems Operational';
              }

              // Group services by groupName
              const groups = {};
              services.forEach(s => {
                const groupName = s.groupName || 'Services';
                if (!groups[groupName]) groups[groupName] = [];
                groups[groupName].push(s);
              });

              let htmlContent = '';
              for (const [groupName, groupServices] of Object.entries(groups)) {
                htmlContent += \`
                  <div class="mb-8">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-3 px-1 flex items-center gap-2">
                      <span>\${groupName}</span>
                      <span class="text-xs font-normal opacity-60">(\${groupServices.length})</span>
                    </h2>
                    \${groupServices.map(s => {
                      const isDown = s.lastStatus === 'unhealthy';
                      const badgeClass = isDown ? 'shad-badge-danger' : 'shad-badge-success';
                      const statusText = isDown ? 'Major Outage' : 'Operational';

                      const urlHtml = s.url ? \`
                        <a href="/service/\${s.id}" class="text-xs text-[hsl(var(--muted-foreground))] hover:underline break-all block mt-0.5">
                          \${s.url}
                        </a>
                      \` : '';

                      return \`
                        <div class="shad-card p-5 mb-4 hover:border-[var(--brand-color)] transition-all">
                          <div class="flex justify-between items-start flex-wrap gap-4 mb-3">
                            <div>
                              <div class="flex items-center gap-2.5 flex-wrap">
                                <a href="/service/\${s.id}" class="text-base font-semibold m-0 hover:underline text-[hsl(var(--foreground))] no-underline">\${s.name}</a>
                                <span class="shad-badge \${badgeClass}">
                                  <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                                  </span>
                                  \${statusText}
                                </span>
                              </div>
                              \${urlHtml}
                            </div>
                            <div class="text-right">
                              <div class="text-2xl font-bold" style="color: \${isDown ? 'var(--danger)' : 'var(--success)'}">
                                \${s.uptime.toFixed(1)}%
                              </div>
                              <div class="text-xs text-[hsl(var(--muted-foreground))]">Checked \${formatRelativeTime(s.lastCheckedAt)}</div>
                            </div>
                          </div>

                          <div>
                            <div class="text-[11px] text-[hsl(var(--muted-foreground))] mb-1.5">Uptime history (24h)</div>
                            <div class="flex gap-1 pt-2 border-t border-[hsl(var(--border))]" id="timeline-\${s.id}"></div>
                          </div>
                        </div>
                      \`;
                    }).join('')}
                  </div>
                \`;
              }

              container.innerHTML = htmlContent;
              services.forEach(s => loadTimeline(s.id));
            } catch (err) {
              console.error('Data load error:', err);
            }
          }

          async function loadTimeline(id) {
            try {
              const res = await fetch(BASE + '/api/services/' + id + '/checks');
              const checks = await res.json();
              const timeline = document.getElementById('timeline-' + id);
              if (!timeline) return;

              if (!checks || !checks.length) {
                timeline.innerHTML = '<div class="timeline-bar" style="background: hsl(var(--muted));" title="No checks yet"></div>';
                return;
              }

              timeline.innerHTML = '';
              checks.slice(0, 90).reverse().forEach(c => {
                const bar = document.createElement('div');
                bar.className = 'timeline-bar';
                const isOk = c.status === 'healthy';
                const latency = c.responseTime;
                bar.style.background = isOk ? (latency > 1000 ? 'var(--warning)' : 'var(--success)') : 'var(--danger)';
                bar.title = \`\${c.status.toUpperCase()} | Latency: \${latency}ms | Region: \${c.region || 'Direct'} | \${new Date(c.timestamp).toLocaleString()}\`;
                timeline.appendChild(bar);
              });
            } catch (e) {
              console.error('Timeline error:', e);
            }
          }

          initTheme();
          loadData();
          setInterval(loadData, 20000);
        `}</script>
      </body>
    </html>
  );
}
