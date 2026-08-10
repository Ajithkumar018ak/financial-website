/* Finova Capital - Dashboard Client & Admin Operations script */

const initDashboard = () => {
    // 1. Initialize Dashboard Menu Tab Switching
    initDashboardTabs();

    // 2. Initialize Mobile Dashboard Sidebar Toggle
    initMobileDashboardSidebar();

    // 3. Initialize User Dashboard Specific Features
    if (document.getElementById('user-dashboard-root')) {
        initUserDashboardCharts();
        initTransactionFilters();
        initTransactionModal();
        initDocumentSearch();
        initMessagesController();
    }

    // 4. Initialize Admin Dashboard Specific Features
    if (document.getElementById('admin-dashboard-root')) {
        initAdminDashboardCharts();
        initClientSearch();
        initClientDetailModal();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

/* ==========================================
   1. Dashboard Menu Tab Switching
   ========================================== */
function initDashboardTabs() {
    const tabLinks = document.querySelectorAll('.dashboard-menu-link');
    const panels = document.querySelectorAll('.dashboard-panel');

    if (tabLinks.length === 0 || panels.length === 0) return;

    const panelNames = {
        'panel-overview': 'Overview',
        'panel-portfolio': 'Portfolios & Goals',
        'panel-tx': 'Transaction Audit',
        'panel-vault': 'Document Vault',
        'panel-chat': 'Messages',
        'panel-settings': 'Settings'
    };

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetPanelId = link.getAttribute('data-panel');
            if (!targetPanelId) return;

            // Update Active Menu State
            document.querySelectorAll('.dashboard-menu-item').forEach(item => {
                item.classList.remove('active');
            });
            link.parentElement.classList.add('active');

            // Toggle Panel Visibility
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            const targetPanel = document.getElementById(targetPanelId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }

            // Update Breadcrumb & Header Title dynamically
            const pageName = panelNames[targetPanelId] || 'Portal';
            const breadcrumbCurrent = document.getElementById('breadcrumb-current');
            if (breadcrumbCurrent) {
                breadcrumbCurrent.textContent = pageName;
            }
            const navbarPageTitle = document.getElementById('navbar-page-title');
            if (navbarPageTitle) {
                navbarPageTitle.textContent = pageName;
            }

            // Close mobile sidebar if open
            const sidebar = document.querySelector('.dashboard-sidebar');
            if (sidebar) {
                sidebar.classList.remove('is-active');
            }
        });
    });
}/* ==========================================
   2. Mobile Dashboard Sidebar Toggle
   ========================================== */
function initMobileDashboardSidebar() {
    const toggleBtn = document.querySelector('.dashboard-sidebar-toggle');
    const sidebar = document.querySelector('.dashboard-sidebar');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('is-active');
    });

    // Close sidebar on clicks outside
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('is-active') && 
            !sidebar.contains(e.target) && 
            !toggleBtn.contains(e.target)) {
            sidebar.classList.remove('is-active');
        }
    });
}

/* ==========================================
   3. User Dashboard Specific Features
   ========================================== */
function initUserDashboardCharts() {
    // 3.1 Portfolio Allocations Doughnut
    const allocCtx = document.getElementById('userAllocChart');
    if (allocCtx && typeof Chart !== 'undefined') {
        new Chart(allocCtx, {
            type: 'doughnut',
            data: {
                labels: ['Equities', 'Fixed Income', 'Alternatives', 'Cash'],
                datasets: [{
                    data: [45, 30, 15, 10],
                    backgroundColor: ['#0F6FFF', '#10B981', '#F59E0B', '#64748B'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '70%'
            }
        });
    }

    // 3.2 Portfolio Growth Over Time Line
    let overviewChartInstance = null;
    const growthCtx = document.getElementById('userGrowthChart');
    if (growthCtx && typeof Chart !== 'undefined') {
        const datasets = {
            '1Y': {
                labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                data: [250000, 265000, 258000, 278000, 292000, 310000, 324500]
            },
            '3Y': {
                labels: ['2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                data: [210000, 250000, 265000, 258000, 278000, 292000, 310000, 324500]
            },
            '5Y': {
                labels: ['2022', '2023', '2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                data: [150000, 185000, 210000, 250000, 265000, 258000, 278000, 292000, 310000, 324500]
            },
            'ALL': {
                labels: ['2020', '2021', '2022', '2023', '2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                data: [100000, 125000, 150000, 185000, 210000, 250000, 265000, 258000, 278000, 292000, 310000, 324500]
            }
        };

        overviewChartInstance = new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: datasets['1Y'].labels,
                datasets: [{
                    label: 'Net Asset Value (NAV)',
                    data: datasets['1Y'].data,
                    borderColor: '#0F6FFF',
                    backgroundColor: 'rgba(15, 111, 255, 0.04)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#0F6FFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    },
                    y: {
                        grid: { color: '#E2E8F0' },
                        ticks: {
                            color: '#64748B',
                            font: { family: 'Plus Jakarta Sans', size: 10 },
                            callback: function(value) { return '$' + (value / 1000).toLocaleString() + 'k'; }
                        }
                    }
                }
            }
        });

        // Add Event Listeners for controls
        const controlButtons = document.querySelectorAll('#nav-chart-controls .btn');
        controlButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                controlButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const period = btn.textContent; // '1Y', '3Y', '5Y', 'All'
                const pKey = period === 'All' ? 'ALL' : period;
                if (datasets[pKey]) {
                    overviewChartInstance.data.labels = datasets[pKey].labels;
                    overviewChartInstance.data.datasets[0].data = datasets[pKey].data;
                    overviewChartInstance.update();
                }
            });
        });
    }

    // 3.3 Portfolio Performance Comparison Chart
    const compareCtx = document.getElementById('userPortfolioCompareChart');
    if (compareCtx && typeof Chart !== 'undefined') {
        const compareDatasets = {
            '1Y': {
                labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                growth: [110000, 120000, 115000, 130000, 138000, 142000, 148200],
                balanced: [90000, 95000, 93000, 102000, 106000, 109000, 112600],
                retirement: [50000, 52000, 51000, 55000, 58000, 60000, 63700]
            },
            '3Y': {
                labels: ['2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                growth: [95000, 110000, 120000, 115000, 130000, 138000, 142000, 148200],
                balanced: [80000, 90000, 95000, 93000, 102000, 106000, 109000, 112600],
                retirement: [45000, 50000, 52000, 51000, 55000, 58000, 60000, 63700]
            },
            '5Y': {
                labels: ['2022', '2023', '2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                growth: [70000, 85000, 95000, 110000, 120000, 115000, 130000, 138000, 142000, 148200],
                balanced: [65000, 75000, 80000, 90000, 95000, 93000, 102000, 106000, 109000, 112600],
                retirement: [35000, 42000, 45000, 50000, 52000, 51000, 55000, 58000, 60000, 63700]
            }
        };

        const compareChartInstance = new Chart(compareCtx, {
            type: 'line',
            data: {
                labels: compareDatasets['1Y'].labels,
                datasets: [
                    {
                        label: 'Growth Portfolio',
                        data: compareDatasets['1Y'].growth,
                        borderColor: '#0F6FFF',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        borderWidth: 2,
                        pointBackgroundColor: '#0F6FFF'
                    },
                    {
                        label: 'Balanced Portfolio',
                        data: compareDatasets['1Y'].balanced,
                        borderColor: '#10B981',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        borderWidth: 2,
                        pointBackgroundColor: '#10B981'
                    },
                    {
                        label: 'Retirement Portfolio',
                        data: compareDatasets['1Y'].retirement,
                        borderColor: '#F59E0B',
                        backgroundColor: 'transparent',
                        tension: 0.3,
                        borderWidth: 2,
                        pointBackgroundColor: '#F59E0B'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Plus Jakarta Sans', size: 10 },
                            color: '#64748B'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    },
                    y: {
                        grid: { color: '#E2E8F0' },
                        ticks: {
                            color: '#64748B',
                            font: { family: 'Plus Jakarta Sans', size: 10 },
                            callback: function(value) { return '$' + (value / 1000).toLocaleString() + 'k'; }
                        }
                    }
                }
            }
        });

        // Add Event Listeners for compare controls
        const compareButtons = document.querySelectorAll('#nav-portfolio-compare-controls .btn');
        compareButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                compareButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const period = btn.textContent; // '1Y', '3Y', '5Y'
                if (compareDatasets[period]) {
                    compareChartInstance.data.labels = compareDatasets[period].labels;
                    compareChartInstance.data.datasets[0].data = compareDatasets[period].growth;
                    compareChartInstance.data.datasets[1].data = compareDatasets[period].balanced;
                    compareChartInstance.data.datasets[2].data = compareDatasets[period].retirement;
                    compareChartInstance.update();
                }
            });
        });
    }
}

function initTransactionFilters() {
    const searchInput = document.getElementById('tx-search');
    const filterDate = document.getElementById('tx-filter-date');
    const filterPortfolio = document.getElementById('tx-filter-portfolio');
    const filterType = document.getElementById('tx-filter-type');
    const filterStatus = document.getElementById('tx-filter-status');
    const btnReset = document.getElementById('btn-reset-tx-filters');
    const rows = document.querySelectorAll('.tx-row');

    if (rows.length === 0) return;

    const filterTable = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const dateVal = filterDate ? filterDate.value : 'all';
        const portfolioVal = filterPortfolio ? filterPortfolio.value : 'all';
        const typeVal = filterType ? filterType.value : 'all';
        const statusVal = filterStatus ? filterStatus.value : 'all';

        rows.forEach(row => {
            const desc = row.getAttribute('data-desc').toLowerCase();
            const ref = row.getAttribute('data-ref').toLowerCase();
            const date = row.getAttribute('data-month');
            const portfolio = row.getAttribute('data-portfolio');
            const type = row.getAttribute('data-type');
            const status = row.getAttribute('data-status');

            // Text search matches description or reference
            const matchesQuery = query === '' || desc.includes(query) || ref.includes(query);
            const matchesDate = dateVal === 'all' || date === dateVal;
            const matchesPortfolio = portfolioVal === 'all' || portfolio === portfolioVal;
            const matchesType = typeVal === 'all' || type === typeVal;
            const matchesStatus = statusVal === 'all' || status === statusVal;

            if (matchesQuery && matchesDate && matchesPortfolio && matchesType && matchesStatus) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    };

    [searchInput, filterDate, filterPortfolio, filterType, filterStatus].forEach(el => {
        if (el) el.addEventListener('input', filterTable);
    });

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterDate) filterDate.value = 'all';
            if (filterPortfolio) filterPortfolio.value = 'all';
            if (filterType) filterType.value = 'all';
            if (filterStatus) filterStatus.value = 'all';
            filterTable();
        });
    }
}

function initTransactionModal() {
    const rows = document.querySelectorAll('.tx-row');
    const modal = document.getElementById('tx-detail-modal');
    const closeBtn = document.getElementById('btn-close-tx-modal');
    const closeBtn2 = document.getElementById('btn-modal-close');

    if (!modal) return;

    rows.forEach(row => {
        row.addEventListener('click', () => {
            const id = row.getAttribute('data-id');
            const date = row.getAttribute('data-date');
            const portfolio = row.getAttribute('data-portfolio');
            const type = row.getAttribute('data-type');
            const amount = row.getAttribute('data-amount');
            const desc = row.getAttribute('data-desc');
            const processed = row.getAttribute('data-processed-by');
            const ref = row.getAttribute('data-ref');
            const status = row.getAttribute('data-status');

            // Set content
            document.getElementById('modal-tx-id').textContent = id;
            document.getElementById('modal-tx-date').textContent = date;
            document.getElementById('modal-tx-portfolio').textContent = portfolio;
            document.getElementById('modal-tx-desc').textContent = desc;
            document.getElementById('modal-tx-processed').textContent = processed;
            document.getElementById('modal-tx-ref').textContent = ref;
            document.getElementById('modal-tx-amount').textContent = amount;

            // Set amount color class
            const amountEl = document.getElementById('modal-tx-amount');
            if (amount.startsWith('+')) {
                amountEl.style.color = 'var(--color-secondary)';
            } else {
                amountEl.style.color = 'var(--color-danger)';
            }

            // Set type styling badge
            const typeEl = document.getElementById('modal-tx-type');
            typeEl.className = 'badge';
            typeEl.style.borderRadius = '6px';
            typeEl.textContent = type;
            if (type === 'Dividend' || type === 'Interest') {
                typeEl.style.backgroundColor = 'rgba(56,189,248,0.08)';
                typeEl.style.color = 'var(--color-primary)';
            } else if (type === 'Contribution') {
                typeEl.style.backgroundColor = 'rgba(16,185,129,0.08)';
                typeEl.style.color = 'var(--color-secondary)';
            } else if (type === 'Fee' || type === 'Withdrawal') {
                typeEl.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                typeEl.style.color = 'var(--color-danger)';
            } else {
                typeEl.style.backgroundColor = 'rgba(100,116,139,0.08)';
                typeEl.style.color = 'var(--color-text-muted)';
            }

            // Change icon based on type
            const iconEl = document.getElementById('modal-tx-icon');
            if (iconEl && typeof lucide !== 'undefined') {
                let iconName = 'receipt';
                if (type === 'Dividend' || type === 'Interest') iconName = 'trending-up';
                else if (type === 'Contribution') iconName = 'arrow-down-right';
                else if (type === 'Withdrawal') iconName = 'arrow-up-right';
                else if (type === 'Fee') iconName = 'percent';
                iconEl.setAttribute('data-lucide', iconName);
                lucide.createIcons();
            }

            // Open modal
            modal.style.display = 'flex';
        });
    });

    const closeModal = () => {
        modal.style.display = 'none';
    };

    [closeBtn, closeBtn2].forEach(btn => {
        if (btn) btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

let currentDocCategory = 'all';

function initDocumentSearch() {
    const searchInput = document.getElementById('doc-search');
    const filterYear = document.getElementById('doc-filter-year');
    const filterPortfolio = document.getElementById('doc-filter-portfolio');
    const btnReset = document.getElementById('btn-reset-doc-filters');
    const docCards = document.querySelectorAll('.doc-card');
    const pillButtons = document.querySelectorAll('#doc-category-pills button');

    if (docCards.length === 0) return;

    const filterDocs = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const yearVal = filterYear ? filterYear.value : 'all';
        const portfolioVal = filterPortfolio ? filterPortfolio.value : 'all';

        docCards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const category = card.getAttribute('data-category');
            const year = card.getAttribute('data-year');
            const portfolio = card.getAttribute('data-portfolio');

            const matchesQuery = query === '' || title.includes(query);
            const matchesCategory = currentDocCategory === 'all' || category === currentDocCategory;
            const matchesYear = yearVal === 'all' || year === yearVal;
            const matchesPortfolio = portfolioVal === 'all' || portfolio === portfolioVal || portfolio === 'All';

            if (matchesQuery && matchesCategory && matchesYear && matchesPortfolio) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    };

    window.filterDocsByCategory = (cat) => {
        currentDocCategory = cat;
        pillButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('onclick').includes(cat)) {
                btn.classList.add('active');
            }
        });
        filterDocs();
    };

    [searchInput, filterYear, filterPortfolio].forEach(el => {
        if (el) el.addEventListener('input', filterDocs);
    });

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            if (filterYear) filterYear.value = 'all';
            if (filterPortfolio) filterPortfolio.value = 'all';
            currentDocCategory = 'all';
            pillButtons.forEach(btn => btn.classList.remove('active'));
            if (pillButtons[0]) pillButtons[0].classList.add('active');
            filterDocs();
        });
    }
}

const messagesData = {
    'MSG-001': {
        sender: 'Sarah Mitchell',
        role: 'Senior Wealth Advisor',
        initials: 'SM',
        subject: 'Tax-Efficient Portfolio Rebalancing Strategy',
        date: 'Aug 10, 2026, 10:24 AM',
        content: `Hello Jonathan,<br><br>I hope you are having a productive week. I recently completed a fiduciary review of your cash holdings and taxable distributions across your Growth and Balanced portfolios.<br><br>Currently, your available cash sits at $18,420 (accounting for 10% of your total allocation). Due to the current yield curves, I recommend initiating a tactical rebalance to move $15,000 from cash into the Municipal Bond Fund. This rebalance will provide tax-exempt interest income while aligning your risk profile back to the moderate threshold.<br><br>Please let me know if you would like me to execute this trade on your behalf, or if you want to set up a short alignment meeting tomorrow.<br><br>Sincerely,<br>Sarah Mitchell`,
        attachments: 'municipal_bond_prospectus.pdf',
        type: 'advisor'
    },
    'MSG-002': {
        sender: 'Marcus Vance',
        role: 'Fiduciary Wealth Manager',
        initials: 'MV',
        subject: 'Municipal Bond Yield Reallocation Advice',
        date: 'Jul 24, 2026, 2:15 PM',
        content: `Hello Jonathan,<br><br>I analyzed the quarterly dividend receipts from your balanced portfolio accounts.<br><br>Since the interest rates are stabilizing, reallocating some of your equity dividends into fixed income assets will hedge against near-term volatility. Let's arrange a 15-minute briefing session sometime this week.<br><br>Regards,<br>Marcus Vance`,
        attachments: null,
        type: 'advisor'
    },
    'MSG-003': {
        sender: 'Finova Security Team',
        role: 'Fiduciary Cybersecurity',
        initials: 'FS',
        subject: 'Multi-Factor Authentication (MFA) Session Activated',
        date: 'Aug 08, 2026, 4:12 PM',
        content: `Dear Fiduciary Client,<br><br>This automated security update confirms that a new web portal session was successfully authenticated using multi-factor credentials.<br><br>Session Metadata:<br>- Timestamp: Aug 08, 2026, 04:12 PM EST<br>- IP Address: 192.168.1.14<br>- Device: MacOS Safari / Chrome Portal Extension<br><br>If this activity was not initiated by you, please trigger a security override from your portal settings immediately.<br><br>Security Operations,<br>Finova Capital Fiduciary Team`,
        attachments: null,
        type: 'system'
    },
    'MSG-004': {
        sender: 'Sarah Mitchell',
        role: 'Senior Wealth Advisor',
        initials: 'SM',
        subject: 'Scheduling Our Annual Portfolio Performance Audit Review',
        date: 'Aug 05, 2026, 9:15 AM',
        content: `Hi Jonathan,<br><br>It is time for our annual portfolio performance audit and goal alignment review.<br><br>We will review your Growth and Balanced portfolios, check target milestones for your Retirement and Legacy goals, and make adjustments for the fiscal year 2027.<br><br>Please select a time slot on our portal appointment page (under contact section) or reply with your availability.<br><br>Best regards,<br>Sarah Mitchell`,
        attachments: null,
        type: 'advisor'
    },
    'MSG-005': {
        sender: 'System Agent',
        role: 'Auto Treasury Processor',
        initials: 'SA',
        subject: 'Scheduled ACH Capital Contribution Executed',
        date: 'Aug 02, 2026, 6:00 AM',
        content: `Transaction Receipt Alert:<br><br>This is to confirm that your recurring scheduled deposit of $5,000 via ACH has cleared. The funds have been allocated to your Balanced Portfolio model reserves.<br><br>Clearance Date: Aug 02, 2026<br>Audit Reference: REF-ACH-98103<br><br>Thank you for choosing Finova Capital.`,
        attachments: null,
        type: 'system'
    },
    'MSG-006': {
        sender: 'System Agent',
        role: 'Secure Fiduciary Storage',
        initials: 'SA',
        subject: 'Filing of Q2 Advisory Statements Complete',
        date: 'Jul 18, 2026, 11:30 AM',
        content: `Digital Vault Notice:<br><br>Your Q2 Monthly Statement and Advisory Performance reports have been generated and archived in your secure vault.<br><br>Fiduciary compliance requires storing these files for 7 years under encrypted custody. You can view or download them at any time from your Document Vault tab.`,
        attachments: null,
        type: 'system'
    }
};

let activeMsgId = 'MSG-001';
let currentMsgFilter = 'all';

function initMessagesController() {
    const cards = document.querySelectorAll('.msg-item');
    const searchInput = document.getElementById('msg-search');
    const btnReplySend = document.getElementById('btn-msg-reply-send');
    const replyText = document.getElementById('msg-reply-text');
    const btnUnread = document.getElementById('btn-msg-unread');
    const btnArchive = document.getElementById('btn-msg-archive');

    if (cards.length === 0) return;

    const selectMessage = (id) => {
        activeMsgId = id;
        cards.forEach(c => {
            c.classList.remove('active');
            c.style.borderColor = '';
            c.style.backgroundColor = '';
            if (c.getAttribute('data-id') === id) {
                c.classList.add('active');
                c.style.borderColor = 'var(--color-primary)';
                c.style.backgroundColor = 'rgba(15,111,255,0.03)';
                
                // Clear unread badge
                const dot = c.querySelector('.unread-dot');
                if (dot) {
                    dot.style.display = 'none';
                    c.setAttribute('data-unread', 'false');
                    updateUnreadCount();
                }
            }
        });

        const data = messagesData[id];
        if (data) {
            document.getElementById('msg-detail-sender').textContent = data.sender;
            document.getElementById('msg-detail-role').textContent = data.role;
            document.getElementById('msg-detail-initials').textContent = data.initials;
            document.getElementById('msg-detail-date').textContent = data.date;
            document.getElementById('msg-detail-subject').textContent = data.subject;
            document.getElementById('msg-detail-content').innerHTML = data.content;

            const attachWrapper = document.getElementById('msg-detail-attachments-wrapper');
            if (data.attachments) {
                document.getElementById('msg-detail-attachment-name').textContent = data.attachments;
                attachWrapper.style.display = 'block';
            } else {
                attachWrapper.style.display = 'none';
            }
        }
    };

    const updateUnreadCount = () => {
        let count = 0;
        cards.forEach(c => {
            if (c.getAttribute('data-unread') === 'true' && c.style.display !== 'none') {
                count++;
            }
        });
        const countEl = document.querySelector('#panel-chat .stat-value');
        if (countEl) {
            countEl.textContent = count;
        }
    };

    const filterMsgs = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        cards.forEach(c => {
            const sender = c.getAttribute('data-sender').toLowerCase();
            const subject = c.getAttribute('data-subject').toLowerCase();
            const unread = c.getAttribute('data-unread') === 'true';
            const type = c.getAttribute('data-type');

            const matchesQuery = query === '' || sender.includes(query) || subject.includes(query);
            let matchesFilter = true;
            if (currentMsgFilter === 'unread') matchesFilter = unread;
            else if (currentMsgFilter === 'advisor') matchesFilter = (type === 'advisor');
            else if (currentMsgFilter === 'system') matchesFilter = (type === 'system');

            if (matchesQuery && matchesFilter) {
                c.style.display = 'block';
            } else {
                c.style.display = 'none';
            }
        });
        updateUnreadCount();
    };

    window.filterMessages = (filter) => {
        currentMsgFilter = filter;
        const pillButtons = document.querySelectorAll('#msg-type-pills button');
        pillButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === filter) {
                btn.classList.add('active');
            } else if (filter === 'all' && btn.textContent === 'All') {
                btn.classList.add('active');
            } else if (filter === 'advisor' && btn.textContent === 'Advisor') {
                btn.classList.add('active');
            } else if (filter === 'system' && btn.textContent === 'System') {
                btn.classList.add('active');
            }
        });
        filterMsgs();
    };

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-id');
            selectMessage(id);
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', filterMsgs);
    }

    if (btnReplySend) {
        btnReplySend.addEventListener('click', () => {
            const text = replyText.value.trim();
            if (text === '') return;
            alert(`🔒 Fiduciary Security Logged:\nReply sent securely to advisor. Sarah Mitchell will review your reply shortly.`);
            replyText.value = '';
        });
    }

    if (btnUnread) {
        btnUnread.addEventListener('click', () => {
            const activeCard = document.querySelector(`.msg-item[data-id="${activeMsgId}"]`);
            if (activeCard) {
                activeCard.setAttribute('data-unread', 'true');
                const dot = activeCard.querySelector('.unread-dot');
                if (dot) dot.style.display = 'block';
                updateUnreadCount();
                alert(`Message marked as unread.`);
            }
        });
    }

    if (btnArchive) {
        btnArchive.addEventListener('click', () => {
            const activeCard = document.querySelector(`.msg-item[data-id="${activeMsgId}"]`);
            if (activeCard) {
                activeCard.style.display = 'none';
                alert(`Message ${activeMsgId} archived successfully.`);
                // Find next visible message to select
                const nextCard = Array.from(cards).find(c => c.style.display !== 'none' && c.getAttribute('data-id') !== activeMsgId);
                if (nextCard) {
                    selectMessage(nextCard.getAttribute('data-id'));
                } else {
                    document.getElementById('msg-detail-body-container').innerHTML = `
                        <div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--color-text-muted); flex-direction:column; gap:0.5rem; text-align:center; padding: 2rem;">
                            <i data-lucide="mail-open" style="width:48px; height:48px; color:var(--color-text-light);"></i>
                            <h3 style="margin:0; font-family:var(--font-heading);">No Messages Selected</h3>
                            <p style="margin:0; font-size:0.85rem;">Select an inbox conversation to read client communication.</p>
                        </div>
                    `;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
                updateUnreadCount();
            }
        });
    }
}

/* ==========================================
   4. Admin Dashboard Specific Features
   ========================================== */
function initAdminDashboardCharts() {
    // 4.1 Asset Trends Under Management Line
    const aumCtx = document.getElementById('adminAumChart');
    if (aumCtx && typeof Chart !== 'undefined') {
        new Chart(aumCtx, {
            type: 'line',
            data: {
                labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
                datasets: [{
                    label: 'Assets Under Management (AUM)',
                    data: [120000000, 165000000, 240000000, 310000000, 480000000, 620000000],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.04)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 3,
                    pointBackgroundColor: '#10B981'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 10 } }
                    },
                    y: {
                        grid: { color: '#E2E8F0' },
                        ticks: {
                            color: '#64748B',
                            font: { family: 'Plus Jakarta Sans', size: 10 },
                            callback: function(value) { return '$' + (value / 1000000).toLocaleString() + 'M'; }
                        }
                    }
                }
            }
        });
    }

    // 4.2 Asset Allocation Across Clients Doughnut
    const shareCtx = document.getElementById('adminShareChart');
    if (shareCtx && typeof Chart !== 'undefined') {
        new Chart(shareCtx, {
            type: 'doughnut',
            data: {
                labels: ['Equities', 'Fixed Income', 'Real Estate', 'Venture Capital', 'Liquidity'],
                datasets: [{
                    data: [50, 20, 12, 10, 8],
                    backgroundColor: ['#0F6FFF', '#10B981', '#38BDF8', '#F59E0B', '#EF4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Plus Jakarta Sans', size: 11 },
                            color: '#64748B'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

function initClientSearch() {
    const searchInput = document.getElementById('client-search');
    const clientRows = document.querySelectorAll('.client-row');

    if (!searchInput || clientRows.length === 0) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        clientRows.forEach(row => {
            const clientName = row.querySelector('.client-name').textContent.toLowerCase();
            const clientEmail = row.querySelector('.client-email').textContent.toLowerCase();
            
            if (clientName.includes(query) || clientEmail.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function initClientDetailModal() {
    const clientRows = document.querySelectorAll('.client-row');
    const modalOverlay = document.getElementById('client-detail-modal');
    const closeBtn = document.getElementById('close-client-modal');

    if (clientRows.length === 0 || !modalOverlay || !closeBtn) return;

    // Click client row to populate and display details
    clientRows.forEach(row => {
        row.addEventListener('click', () => {
            const name = row.getAttribute('data-name');
            const email = row.getAttribute('data-email');
            const status = row.getAttribute('data-status');
            const portfolio = row.getAttribute('data-portfolio');
            const risk = row.getAttribute('data-risk');
            const advisor = row.getAttribute('data-advisor');

            // Populate Modal DOM Elements
            document.getElementById('modal-client-name').textContent = name;
            document.getElementById('modal-client-email').textContent = email;
            document.getElementById('modal-client-status').textContent = status;
            document.getElementById('modal-client-portfolio').textContent = portfolio;
            document.getElementById('modal-client-risk').textContent = risk;
            document.getElementById('modal-client-advisor').textContent = advisor;

            // Set Status Badge Class
            const statusBadge = document.getElementById('modal-client-status');
            statusBadge.className = 'badge';
            if (status === 'Active') {
                statusBadge.classList.add('badge-success');
            } else if (status === 'Review Needed') {
                statusBadge.classList.add('badge-warning');
            } else {
                statusBadge.classList.add('badge-danger');
            }

            modalOverlay.classList.add('is-active');
        });
    });

    // Close Modal actions
    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('is-active');
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('is-active');
        }
    });
}
