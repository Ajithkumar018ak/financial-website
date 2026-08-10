/* Finova Capital - Dashboard Client & Admin Operations script */

const initDashboard = () => {
    // 1. Initialize Dashboard Menu Tab Switching
    initDashboardTabs();

    // 2. Initialize Mobile Dashboard Sidebar Toggle
    initMobileDashboardSidebar();

    // 3. Initialize User Dashboard Specific Features
    if (document.getElementById('user-dashboard-root')) {
        initUserDashboardCharts();
        initDocumentSearch();
        initMessageReplies();
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

            // Close mobile sidebar if open
            const sidebar = document.querySelector('.dashboard-sidebar');
            if (sidebar) {
                sidebar.classList.remove('is-active');
            }
        });
    });
}

/* ==========================================
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
                labels: ['Domestic Equities', 'Fixed Income', 'International Equities', 'Alternatives', 'Cash Reserves'],
                datasets: [{
                    data: [45, 25, 15, 10, 5],
                    backgroundColor: ['#0F6FFF', '#10B981', '#38BDF8', '#F59E0B', '#64748B'],
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

    // 3.2 Portfolio Growth Over Time Line
    const growthCtx = document.getElementById('userGrowthChart');
    if (growthCtx && typeof Chart !== 'undefined') {
        new Chart(growthCtx, {
            type: 'line',
            data: {
                labels: ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026', 'Q3 2026'],
                datasets: [{
                    label: 'Net Asset Value (NAV)',
                    data: [250000, 265000, 258000, 278000, 292000, 310000, 324500],
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
    }
}

function initDocumentSearch() {
    const searchInput = document.getElementById('doc-search');
    const docRows = document.querySelectorAll('.document-row');

    if (!searchInput || docRows.length === 0) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        docRows.forEach(row => {
            const docName = row.querySelector('.document-name').textContent.toLowerCase();
            const docCat = row.querySelector('.document-cat').textContent.toLowerCase();
            
            if (docName.includes(query) || docCat.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

function initMessageReplies() {
    const sendBtn = document.getElementById('dashboard-send-message');
    const inputField = document.getElementById('dashboard-message-input');
    const messageContainer = document.getElementById('dashboard-chat-box');

    if (!sendBtn || !inputField || !messageContainer) return;

    const sendMessage = () => {
        const text = inputField.value.trim();
        if (text === '') return;

        // Append User Message
        const userMsg = document.createElement('div');
        userMsg.style.display = 'flex';
        userMsg.style.justifyContent = 'flex-end';
        userMsg.style.marginBottom = '1rem';
        userMsg.innerHTML = `
            <div style="background-color: var(--color-primary); color: #FFF; padding: 0.8rem 1.2rem; border-radius: 12px 12px 0 12px; max-width: 70%; font-size: 0.9rem; box-shadow: var(--shadow-soft);">
                ${text}
                <div style="font-size: 0.7rem; opacity: 0.7; text-align: right; margin-top: 0.3rem;">Just now</div>
            </div>
        `;
        messageContainer.appendChild(userMsg);
        inputField.value = '';
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // Mock Advisor Reply
        setTimeout(() => {
            const advisorMsg = document.createElement('div');
            advisorMsg.style.display = 'flex';
            advisorMsg.style.justifyContent = 'flex-start';
            advisorMsg.style.marginBottom = '1rem';
            advisorMsg.innerHTML = `
                <div style="background-color: var(--color-section-bg-3); color: var(--color-text-main); padding: 0.8rem 1.2rem; border-radius: 12px 12px 12px 0; max-width: 70%; font-size: 0.9rem; border: var(--border-card); box-shadow: var(--shadow-soft);">
                    Thank you for your message. I have received your request and will review your file shortly.
                    <div style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.3rem;">Just now</div>
                </div>
            `;
            messageContainer.appendChild(advisorMsg);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }, 1200);
    };

    sendBtn.addEventListener('click', sendMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
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
