/* ==========================================================
   Finova Capital — Admin Dashboard Extended JavaScript
   Handles: charts, sidebar, mobile, tab names, client search
   ========================================================== */

(function () {
    'use strict';

    // ── Panel name map (extends base dashboard.js) ──
    const adminPanelNames = {
        'admin-overview':   'System KPIs',
        'admin-clients':    'Fiduciary Clients',
        'admin-portfolio':  'Portfolio Oversight',
        'admin-ops':        'Investment Operations',
        'admin-compliance': 'Compliance & Risk',
        'admin-reports':    'Reports & Analytics',
        'admin-team':       'Team & Access',
        'admin-settings':   'Console Settings'
    };

    // ── Shared chart defaults ──
    const chartFont = { family: 'Plus Jakarta Sans', size: 10 };
    const gridColor = '#E2E8F0';
    const tickColor = '#64748B';

    function moneyM(v) { return '$' + (v / 1_000_000).toFixed(1) + 'M'; }
    function moneyK(v) { return '$' + (v / 1_000).toFixed(0) + 'K'; }

    // ══════════════════════════════════════════════════════
    //  1.  ADMIN NAVIGATION TAB SWITCHER
    // ══════════════════════════════════════════════════════
    function initAdminTabs() {
        const tabLinks = document.querySelectorAll('.admin-menu-link');
        const panels   = document.querySelectorAll('.dashboard-panel');
        const titleEl  = document.getElementById('admin-page-title');
        const bcEl     = document.getElementById('admin-breadcrumb-current');

        tabLinks.forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const panelId = link.getAttribute('data-panel');
                if (!panelId) return;

                // Active nav state
                document.querySelectorAll('.admin-menu-item').forEach(li => li.classList.remove('active'));
                link.closest('.admin-menu-item').classList.add('active');

                // Show/hide panels
                panels.forEach(p => p.classList.remove('active'));
                const target = document.getElementById(panelId);
                if (target) target.classList.add('active');

                // Update title / breadcrumb
                const name = adminPanelNames[panelId] || 'Admin Portal';
                if (titleEl) titleEl.textContent = name;
                if (bcEl)    bcEl.textContent = name;

                // Close mobile sidebar drawer via shared function
                if (typeof window._adminCloseSidebar === 'function') {
                    window._adminCloseSidebar();
                }

                // Lazy-init charts for the panel that just became visible
                initChartsForPanel(panelId);
            });
        });
    }

    // ══════════════════════════════════════════════════════
    //  2.  MOBILE SIDEBAR — clean state management
    // ══════════════════════════════════════════════════════
    function initAdminMobileSidebar() {
        const hamburger = document.getElementById('admin-hamburger');
        const sidebar   = document.getElementById('admin-sidebar');
        const overlay   = document.querySelector('.sidebar-overlay');

        if (!hamburger || !sidebar) return;

        function openSidebar() {
            sidebar.classList.add('open');
            document.body.classList.add('sidebar-open');
            if (overlay) {
                overlay.classList.add('active');
            }
            hamburger.setAttribute('aria-expanded', 'true');
        }

        function closeSidebar() {
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
            if (overlay) {
                overlay.classList.remove('active');
            }
            hamburger.setAttribute('aria-expanded', 'false');
        }

        function toggleSidebar() {
            if (sidebar.classList.contains('open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        }

        // Hamburger click
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });

        // Overlay click
        if (overlay) {
            overlay.addEventListener('click', function() {
                closeSidebar();
            });
        }

        // ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                closeSidebar();
            }
        });

        // Click outside sidebar (but not on hamburger)
        document.addEventListener('click', function(e) {
            if (
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== hamburger &&
                !hamburger.contains(e.target)
            ) {
                closeSidebar();
            }
        });

        // Expose closeSidebar so tab switcher can call it
        window._adminCloseSidebar = closeSidebar;
    }


    // ══════════════════════════════════════════════════════
    //  3.  CLIENT TABLE SEARCH (admin-clients panel)
    // ══════════════════════════════════════════════════════
    function initAdminClientSearch() {
        const searchInput  = document.getElementById('client-search');
        const riskFilter   = document.getElementById('client-risk-filter');
        const statusFilter = document.getElementById('client-status-filter');
        const advisorFilter = document.getElementById('client-advisor-filter');
        const rows         = document.querySelectorAll('#admin-clients .client-row');

        function filterRows() {
            const q       = (searchInput  ? searchInput.value.toLowerCase()  : '');
            const risk    = (riskFilter   ? riskFilter.value.toLowerCase()   : '');
            const status  = (statusFilter ? statusFilter.value.toLowerCase() : '');
            const advisor = (advisorFilter ? advisorFilter.value.toLowerCase() : '');

            rows.forEach(row => {
                const name    = (row.dataset.name    || '').toLowerCase();
                const riskD   = (row.dataset.risk    || '').toLowerCase();
                const statusD = (row.dataset.status  || '').toLowerCase();
                const advD    = (row.dataset.advisor || '').toLowerCase();

                const matchQ       = !q      || name.includes(q);
                const matchRisk    = !risk   || riskD.includes(risk);
                const matchStatus  = !status || statusD.includes(status);
                const matchAdvisor = !advisor || advD.includes(advisor);

                row.style.display = (matchQ && matchRisk && matchStatus && matchAdvisor) ? '' : 'none';
            });
        }

        [searchInput, riskFilter, statusFilter, advisorFilter].forEach(el => {
            if (el) el.addEventListener('input', filterRows);
        });
    }

    // ══════════════════════════════════════════════════════
    //  4.  CHART INITIALIZATION (lazy per panel)
    // ══════════════════════════════════════════════════════

    const _chartInited = new Set();

    function initChartsForPanel(panelId) {
        if (_chartInited.has(panelId)) return;
        _chartInited.add(panelId);

        if (typeof Chart === 'undefined') return;

        switch (panelId) {
            case 'admin-overview':   initOverviewCharts();   break;
            case 'admin-portfolio':  initPortfolioCharts();  break;
            case 'admin-reports':    initReportsCharts();    break;
        }
    }

    /* ── System KPI Charts ── */
    function initOverviewCharts() {
        // AUM Growth Bar Chart (Q1 2025 – Q2 2026)
        const aumCtx = document.getElementById('adminAumChart');
        if (aumCtx) {
            new Chart(aumCtx, {
                type: 'bar',
                data: {
                    labels: ['Q1 2025','Q2 2025','Q3 2025','Q4 2025','Q1 2026','Q2 2026'],
                    datasets: [{
                        label: 'AUM ($M)',
                        data: [468, 492, 524, 558, 592, 624.8],
                        backgroundColor: 'rgba(15,111,255,0.15)',
                        borderColor: '#0F6FFF',
                        borderWidth: 2,
                        borderRadius: 4,
                        borderSkipped: false
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: tickColor, font: chartFont } },
                        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: chartFont, callback: v => '$' + v + 'M' }, beginAtZero: false, min: 400 }
                    }
                }
            });
        }

        // Allocation Doughnut
        const shareCtx = document.getElementById('adminShareChart');
        if (shareCtx) {
            new Chart(shareCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Equities','Fixed Income','Alternatives','Real Estate','Cash'],
                    datasets: [{
                        data: [42, 26, 14, 12, 6],
                        backgroundColor: ['#0F6FFF','#10B981','#38BDF8','#F59E0B','#EF4444'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    cutout: '68%'
                }
            });
        }
    }

    /* ── Portfolio Oversight Charts ── */
    function initPortfolioCharts() {
        const ctx = document.getElementById('adminPortfolioChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'],
                    datasets: [
                        {
                            label: 'Portfolio Return',
                            data: [0, 2.1, 4.8, 6.2, 8.4, 9.6, 10.8, 11.7],
                            borderColor: '#0F6FFF',
                            backgroundColor: 'rgba(15,111,255,0.06)',
                            fill: true,
                            tension: 0.35,
                            borderWidth: 2.5,
                            pointBackgroundColor: '#0F6FFF',
                            pointRadius: 3
                        },
                        {
                            label: 'Benchmark (S&P 500)',
                            data: [0, 1.2, 2.8, 4.0, 5.6, 6.8, 7.6, 8.3],
                            borderColor: '#10B981',
                            backgroundColor: 'transparent',
                            tension: 0.35,
                            borderWidth: 2,
                            pointBackgroundColor: '#10B981',
                            pointRadius: 3
                        },
                        {
                            label: 'Target',
                            data: [0, 1.5, 3.0, 4.5, 6.0, 7.5, 9.0, 10.5],
                            borderColor: '#F59E0B',
                            backgroundColor: 'transparent',
                            tension: 0.35,
                            borderWidth: 1.5,
                            borderDash: [5, 4],
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false  // Custom legend in HTML
                        },
                        tooltip: {
                            callbacks: {
                                label: ctx => ctx.dataset.label + ': +' + ctx.parsed.y + '%'
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: tickColor, font: chartFont } },
                        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: chartFont, callback: v => '+' + v + '%' } }
                    }
                }
            });
        }
    }

    /* ── Reports & Analytics Charts ── */
    function initReportsCharts() {
        // AUM Growth
        mkLine('adminReportsAumChart',
            ['Q1 25','Q2 25','Q3 25','Q4 25','Q1 26','Q2 26'],
            [468, 492, 524, 558, 592, 624.8],
            '#10B981',
            v => '$' + v + 'M'
        );

        // Client Acquisition
        mkBar('adminReportsClientChart',
            ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
            [8, 12, 11, 14, 18, 16, 19],
            '#0F6FFF',
            v => v + ' clients'
        );

        // Net Cash Flow
        mkBar('adminReportsCashChart',
            ['Q3 25','Q4 25','Q1 26','Q2 26'],
            [12.4, 14.8, 16.2, 18.6],
            '#38BDF8',
            v => '$' + v + 'M'
        );

        // Portfolio Performance (grouped)
        mkLine('adminReportsPerfChart',
            ['Q1 25','Q2 25','Q3 25','Q4 25','Q1 26','Q2 26'],
            [8.2, 9.1, 9.8, 10.4, 11.1, 11.7],
            '#F59E0B',
            v => '+' + v + '%'
        );

        // Revenue Trend
        mkBar('adminReportsRevenueChart',
            ['Q1 25','Q2 25','Q3 25','Q4 25','Q1 26','Q2 26'],
            [2.1, 2.4, 2.8, 3.1, 3.4, 3.8],
            '#8B5CF6',
            v => '$' + v + 'M'
        );

        // Risk Distribution Doughnut
        const riskCtx = document.getElementById('adminReportsRiskChart');
        if (riskCtx) {
            new Chart(riskCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Low','Moderate','Elevated','High'],
                    datasets: [{ data: [71.8, 22.8, 4.3, 1.1], backgroundColor: ['#10B981','#38BDF8','#F59E0B','#EF4444'], borderWidth: 0 }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { font: { family: 'Plus Jakarta Sans', size: 9 }, color: tickColor, boxWidth: 10 } } },
                    cutout: '60%'
                }
            });
        }
    }

    /* ── Chart helpers ── */
    function mkLine(id, labels, data, color, callbackFn) {
        const ctx = document.getElementById(id);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data,
                    borderColor: color,
                    backgroundColor: hexAlpha(color, 0.08),
                    fill: true,
                    tension: 0.35,
                    borderWidth: 2,
                    pointRadius: 2,
                    pointBackgroundColor: color
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: tickColor, font: chartFont } },
                    y: { grid: { color: gridColor }, ticks: { color: tickColor, font: chartFont, callback: callbackFn } }
                }
            }
        });
    }

    function mkBar(id, labels, data, color, callbackFn) {
        const ctx = document.getElementById(id);
        if (!ctx) return;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: hexAlpha(color, 0.15),
                    borderColor: color,
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: tickColor, font: chartFont } },
                    y: { grid: { color: gridColor }, ticks: { color: tickColor, font: chartFont, callback: callbackFn } }
                }
            }
        });
    }

    function hexAlpha(hex, alpha) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // ══════════════════════════════════════════════════════
    //  5.  BOOT
    // ══════════════════════════════════════════════════════
    function boot() {
        if (!document.getElementById('admin-dashboard-root')) return;

        initAdminTabs();
        initAdminMobileSidebar();
        initAdminClientSearch();

        // Init charts for the default active panel
        initChartsForPanel('admin-overview');

        // Re-create Lucide icons for any dynamically rendered icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

})();
