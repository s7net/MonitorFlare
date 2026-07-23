import { Html } from '@elysiajs/html';

interface Props {
  service: any;
  checks: any[];
  uptime: number;
  isAdmin?: boolean;
  adminPath?: string;
}

export function MonitoringPage({ service, checks, uptime, isAdmin = false, adminPath = '/manage-x7k9' }: Props) {
  const avgResponse = checks.length
    ? Math.round(checks.reduce((a: number, c: any) => a + c.responseTime, 0) / checks.length)
    : 0;

  const maxResponse = checks.length
    ? Math.max(...checks.map((c: any) => c.responseTime))
    : 0;

  const failedChecks = checks.filter((c: any) => c.status === 'unhealthy').length;
  const recentIncidents = checks.filter((c: any) => c.status === 'unhealthy').slice(0, 20);

  const isDown = service.lastStatus === 'unhealthy';

  return (
    <html lang="en" data-theme="system">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{service.name} - Detailed Monitoring</title>
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
            padding: 0;
          }

          .shad-card {
            background-color: hsl(var(--card));
            color: hsl(var(--card-foreground));
            border: 1px solid hsl(var(--border));
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          }

          .shad-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            border-radius: 9999px;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .shad-badge-success {
            background-color: rgba(16, 185, 129, 0.1);
            color: var(--success);
            border: 1px solid rgba(16, 185, 129, 0.2);
          }
          .shad-badge-danger {
            background-color: rgba(239, 68, 68, 0.1);
            color: var(--danger);
            border: 1px solid rgba(239, 68, 68, 0.2);
          }

          .timeline-bar {
            flex: 1;
            height: 32px;
            border-radius: 3px;
            transition: all 0.15s ease;
            cursor: pointer;
          }
          .timeline-bar:hover { opacity: 0.8; transform: scaleY(1.08); }
        `}</style>
      </head>
      <body>
        <div class="max-w-5xl mx-auto px-4 py-10">
          <div class="flex justify-between items-center mb-8">
            <a href="/" class="text-xs text-[hsl(var(--muted-foreground))] hover:underline font-medium">← Back to Overview</a>
            {isAdmin && (
              <a href={adminPath} class="text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--brand-color)] text-white no-underline">
                Admin Dashboard
              </a>
            )}
          </div>

          <div class="mb-8">
            <div class="flex items-center gap-3 flex-wrap mb-2">
              <h1 class="text-3xl font-bold tracking-tight m-0">{service.name}</h1>
              <span class={`shad-badge ${isDown ? 'shad-badge-danger' : 'shad-badge-success'}`}>
                <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                {isDown ? 'Major Outage' : 'Operational'}
              </span>
              {service.groupName && (
                <span class="text-xs uppercase font-bold px-2 py-0.5 rounded bg-muted text-[hsl(var(--muted-foreground))]">
                  {service.groupName}
                </span>
              )}
            </div>

            {service.url ? (
              <a href={service.url} target="_blank" rel="noopener" class="text-xs text-[hsl(var(--muted-foreground))] hover:underline break-all">
                {service.url}
              </a>
            ) : (
              <span class="text-xs text-[hsl(var(--muted-foreground))]">(Target Hidden)</span>
            )}
          </div>

          {/* Stats Grid */}
          <div class="shad-card p-6 mb-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div class="text-xs text-[hsl(var(--muted-foreground))] mb-1">Uptime (24h)</div>
                <div class="text-3xl font-bold" style={`color: ${isDown ? 'var(--danger)' : 'var(--success)'}`}>
                  {uptime.toFixed(2)}%
                </div>
              </div>
              <div>
                <div class="text-xs text-[hsl(var(--muted-foreground))] mb-1">Total Checks</div>
                <div class="text-3xl font-bold">{checks.length}</div>
              </div>
              <div>
                <div class="text-xs text-[hsl(var(--muted-foreground))] mb-1">Failed Checks</div>
                <div class="text-3xl font-bold style='color: var(--danger);'">{failedChecks}</div>
              </div>
              <div>
                <div class="text-xs text-[hsl(var(--muted-foreground))] mb-1">Avg Latency</div>
                <div class="text-3xl font-bold">{avgResponse}<span class="text-sm font-normal text-[hsl(var(--muted-foreground))]">ms</span></div>
              </div>
            </div>
          </div>

          {/* Response Time Latency Trend SVG Chart */}
          <div class="shad-card p-6 mb-8">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-base font-semibold tracking-tight m-0">Response Time Latency Trend (ms)</h2>
              <div class="text-xs text-[hsl(var(--muted-foreground))] font-semibold">Peak: {maxResponse}ms</div>
            </div>
            <div class="w-full h-44 relative" id="chart-container">
              <svg id="latency-svg" class="w-full h-full overflow-visible"></svg>
            </div>
          </div>

          {/* Timeline Bar */}
          <div class="mb-10">
            <h2 class="text-base font-semibold tracking-tight mb-4">Uptime History (Last 24 Hours)</h2>
            <div class="shad-card p-4 flex gap-1" id="timeline-container"></div>
            <div class="flex justify-between text-xs text-[hsl(var(--muted-foreground))] mt-2">
              <span>24 hours ago</span>
              <span>Now</span>
            </div>
          </div>

          {/* Incidents History */}
          <div>
            <h2 class="text-base font-semibold tracking-tight mb-4">Recent Service Incidents</h2>
            <div id="incidents-history">
              {recentIncidents.length === 0 ? (
                <div class="shad-card p-10 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  No outage incidents recorded in the last 24 hours.
                </div>
              ) : (
                recentIncidents.map((inc: any) => (
                  <div class="shad-card p-5 border-l-4 border-l-red-500 mb-3">
                    <div class="flex justify-between flex-wrap gap-3">
                      <div>
                        <div class="text-xs font-semibold text-[var(--danger)] mb-1">Service Outage</div>
                        <div class="text-xs text-[hsl(var(--muted-foreground))]">Response time: {inc.responseTime}ms • HTTP Status: {inc.statusCode || 'Failed'} • Region: {inc.region || 'Direct'}</div>
                        {inc.error && (
                          <div class="text-xs mt-2 p-2 rounded bg-red-500/10 text-[var(--danger)]">
                            {inc.error}
                          </div>
                        )}
                      </div>
                      <div class="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(inc.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <script>{`
          const checks = ${JSON.stringify(checks.slice(0, 90).reverse())};
          const container = document.getElementById('timeline-container');
          
          if (checks.length === 0) {
            container.innerHTML = '<div class="timeline-bar" style="background: hsl(var(--muted));"></div>';
          } else {
            checks.forEach(c => {
              const bar = document.createElement('div');
              bar.className = 'timeline-bar';
              const isHealthy = c.status === 'healthy';
              bar.style.background = isHealthy ? (c.responseTime > 1000 ? 'var(--warning)' : 'var(--success)') : 'var(--danger)';
              bar.title = \`\${c.status.toUpperCase()} | Latency: \${c.responseTime}ms | Region: \${c.region || 'Direct'} | \${new Date(c.timestamp).toLocaleString()}\`;
              container.appendChild(bar);
            });
          }

          // Render Latency SVG Chart
          function renderLatencyChart() {
            const svg = document.getElementById('latency-svg');
            if (!svg || checks.length < 2) return;

            const width = svg.clientWidth || 800;
            const height = svg.clientHeight || 170;
            const padding = 20;

            const latencies = checks.map(c => c.responseTime || 0);
            const maxL = Math.max(...latencies, 50);
            const minL = 0;

            const points = checks.map((c, i) => {
              const x = padding + (i / (checks.length - 1)) * (width - 2 * padding);
              const y = height - padding - ((c.responseTime - minL) / (maxL - minL)) * (height - 2 * padding);
              return { x, y, val: c.responseTime, status: c.status };
            });

            const pathD = points.reduce((acc, p, i) => i === 0 ? \`M \${p.x} \${p.y}\` : \`\${acc} L \${p.x} \${p.y}\`, '');
            const areaD = \`\${pathD} L \${points[points.length - 1].x} \${height - padding} L \${points[0].x} \${height - padding} Z\`;

            svg.innerHTML = \`
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
                  <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="\${areaD}" fill="url(#chartGrad)" />
              <path d="\${pathD}" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              \${points.map(p => \`
                <circle cx="\${p.x}" cy="\${p.y}" r="3" fill="\${p.status === 'healthy' ? '#10b981' : '#ef4444'}" stroke="#ffffff" stroke-width="1">
                  <title>\${p.val}ms</title>
                </circle>
              \`).join('')}
            \`;
          }

          renderLatencyChart();
          window.addEventListener('resize', renderLatencyChart);
        `}</script>
      </body>
    </html>
  );
}
