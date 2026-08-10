/* Finova Capital - Calculator Engines & Risk Assessment Logic */

const initCalculators = () => {
    // 1. Initialize Loan EMI Calculator
    initLoanCalculator();

    // 2. Initialize Retirement Planner
    initRetirementCalculator();

    // 3. Initialize Tax Estimator
    initTaxCalculator();

    // 4. Initialize Risk Assessment Quiz
    initRiskQuiz();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculators);
} else {
    initCalculators();
}

// Helper function to format currency
function formatCurrency(val) {
    return '$' + Math.round(val).toLocaleString();
}

/* ==========================================
   1. Loan EMI Calculator
   ========================================== */
let loanChart = null;

function initLoanCalculator() {
    const loanAmountInput = document.getElementById('loan-amount');
    const loanInterestInput = document.getElementById('loan-interest');
    const loanTenureInput = document.getElementById('loan-tenure');

    if (!loanAmountInput || !loanInterestInput || !loanTenureInput) return;

    const inputs = [loanAmountInput, loanInterestInput, loanTenureInput];
    
    // Add event listeners to update values on slide
    inputs.forEach(input => {
        const valDisplay = document.getElementById(input.id + '-val');
        
        // Sync text display with slider
        input.addEventListener('input', () => {
            if (valDisplay) {
                if (input.id === 'loan-amount') {
                    valDisplay.textContent = parseInt(input.value).toLocaleString();
                } else if (input.id === 'loan-interest') {
                    valDisplay.textContent = parseFloat(input.value).toFixed(1);
                } else {
                    valDisplay.textContent = input.value;
                }
            }
            calculateLoanEMI();
        });
    });

    // Initial calculation
    calculateLoanEMI();
}

function calculateLoanEMI() {
    const P = parseFloat(document.getElementById('loan-amount').value);
    const R = parseFloat(document.getElementById('loan-interest').value);
    const N = parseFloat(document.getElementById('loan-tenure').value);

    const r = R / (12 * 100); // monthly interest rate
    const n = N * 12; // tenure in months

    // EMI = [P x r x (1+r)^n]/[(1+r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    // Update UI numbers
    document.getElementById('emi-monthly-result').textContent = formatCurrency(emi);
    document.getElementById('emi-interest-result').textContent = formatCurrency(totalInterest);
    document.getElementById('emi-total-result').textContent = formatCurrency(totalPayment);

    // Render/Update Chart.js Pie Chart
    const ctx = document.getElementById('loanChart');
    if (!ctx) return;

    if (loanChart) {
        loanChart.data.datasets[0].data = [P, totalInterest];
        loanChart.update();
    } else if (typeof Chart !== 'undefined') {
        loanChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Principal Amount', 'Total Interest'],
                datasets: [{
                    data: [P, totalInterest],
                    backgroundColor: ['#0F6FFF', '#10B981'],
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
                            font: { family: 'Plus Jakarta Sans', size: 12 },
                            color: '#64748B'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

/* ==========================================
   2. Retirement Planner
   ========================================== */
let retirementChart = null;

function initRetirementCalculator() {
    const currentAgeInput = document.getElementById('ret-current-age');
    const targetAgeInput = document.getElementById('ret-target-age');
    const currentSavingsInput = document.getElementById('ret-savings');
    const monthlyContInput = document.getElementById('ret-monthly-contribution');
    const returnRateInput = document.getElementById('ret-return-rate');

    if (!currentAgeInput || !targetAgeInput || !currentSavingsInput || !monthlyContInput || !returnRateInput) return;

    const inputs = [currentAgeInput, targetAgeInput, currentSavingsInput, monthlyContInput, returnRateInput];

    inputs.forEach(input => {
        const valDisplay = document.getElementById(input.id + '-val');
        input.addEventListener('input', () => {
            if (valDisplay) {
                if (input.id === 'ret-savings' || input.id === 'ret-monthly-contribution') {
                    valDisplay.textContent = parseInt(input.value).toLocaleString();
                } else if (input.id === 'ret-return-rate') {
                    valDisplay.textContent = parseFloat(input.value).toFixed(1);
                } else {
                    valDisplay.textContent = input.value;
                }
            }
            calculateRetirement();
        });
    });

    calculateRetirement();
}

function calculateRetirement() {
    const currentAge = parseInt(document.getElementById('ret-current-age').value);
    const targetAge = parseInt(document.getElementById('ret-target-age').value);
    const currentSavings = parseFloat(document.getElementById('ret-savings').value);
    const monthlyContribution = parseFloat(document.getElementById('ret-monthly-contribution').value);
    const rate = parseFloat(document.getElementById('ret-return-rate').value) / 100;

    const yearsToInvest = targetAge - currentAge;
    
    if (yearsToInvest <= 0) {
        document.getElementById('ret-corpus-result').textContent = formatCurrency(currentSavings);
        document.getElementById('ret-monthly-payout').textContent = '$0';
        return;
    }

    let balance = currentSavings;
    const monthlyRate = rate / 12;
    const months = yearsToInvest * 12;
    
    const chartLabels = [];
    const chartData = [];

    chartLabels.push(currentAge);
    chartData.push(balance);

    for (let m = 1; m <= months; m++) {
        balance = balance * (1 + monthlyRate) + monthlyContribution;
        
        // Push label and balance to chart array every year
        if (m % 12 === 0) {
            const yearNum = currentAge + (m / 12);
            chartLabels.push(yearNum);
            chartData.push(Math.round(balance));
        }
    }

    // Monthly Safe Withdrawal Rate (Assume 4% rule: Corpus * 4% / 12 months)
    const annualWithdrawal = balance * 0.04;
    const monthlyPayout = annualWithdrawal / 12;

    document.getElementById('ret-corpus-result').textContent = formatCurrency(balance);
    document.getElementById('ret-monthly-payout').textContent = formatCurrency(monthlyPayout);

    // Plot/Update growth projection line chart
    const ctx = document.getElementById('retirementChart');
    if (!ctx) return;

    if (retirementChart) {
        retirementChart.data.labels = chartLabels;
        retirementChart.data.datasets[0].data = chartData;
        retirementChart.update();
    } else if (typeof Chart !== 'undefined') {
        retirementChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Wealth Accumulation Projections',
                    data: chartData,
                    borderColor: '#0F6FFF',
                    backgroundColor: 'rgba(15, 111, 255, 0.05)',
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
                        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans' } }
                    },
                    y: {
                        grid: { color: '#E2E8F0' },
                        ticks: { 
                            color: '#64748B', 
                            font: { family: 'Plus Jakarta Sans' },
                            callback: function(value) { return '$' + (value / 1000).toLocaleString() + 'k'; }
                        }
                    }
                }
            }
        });
    }
}

/* ==========================================
   3. Tax Estimator
   ========================================== */
let taxChart = null;

function initTaxCalculator() {
    const annualIncomeInput = document.getElementById('tax-income');
    const deductionsInput = document.getElementById('tax-deductions');

    if (!annualIncomeInput || !deductionsInput) return;

    const inputs = [annualIncomeInput, deductionsInput];

    inputs.forEach(input => {
        const valDisplay = document.getElementById(input.id + '-val');
        input.addEventListener('input', () => {
            if (valDisplay) {
                valDisplay.textContent = parseInt(input.value).toLocaleString();
            }
            calculateTax();
        });
    });

    calculateTax();
}

function calculateTax() {
    const income = parseFloat(document.getElementById('tax-income').value);
    const deductions = parseFloat(document.getElementById('tax-deductions').value);

    const taxableIncome = Math.max(0, income - deductions);

    // Simplified Tax Brackets
    // 0 to 11k: 10%, 11k to 44.7k: 12%, 44.7k to 95.3k: 22%, 95.3k to 182.1k: 24%, Over 182.1k: 32%
    let tax = 0;
    if (taxableIncome > 0) {
        if (taxableIncome <= 11000) {
            tax = taxableIncome * 0.10;
        } else if (taxableIncome <= 44725) {
            tax = (11000 * 0.10) + ((taxableIncome - 11000) * 0.12);
        } else if (taxableIncome <= 95375) {
            tax = (11000 * 0.10) + ((44725 - 11000) * 0.12) + ((taxableIncome - 44725) * 0.22);
        } else if (taxableIncome <= 182100) {
            tax = (11000 * 0.10) + ((44725 - 11000) * 0.12) + ((95375 - 44725) * 0.22) + ((taxableIncome - 95375) * 0.24);
        } else {
            tax = (11000 * 0.10) + ((44725 - 11000) * 0.12) + ((95375 - 44725) * 0.22) + ((182100 - 95375) * 0.24) + ((taxableIncome - 182100) * 0.32);
        }
    }

    const netPay = income - tax;
    const effectiveRate = income > 0 ? (tax / income) * 100 : 0;

    document.getElementById('tax-taxable-result').textContent = formatCurrency(taxableIncome);
    document.getElementById('tax-liability-result').textContent = formatCurrency(tax);
    document.getElementById('tax-net-result').textContent = formatCurrency(netPay);
    document.getElementById('tax-rate-result').textContent = effectiveRate.toFixed(1) + '%';

    // Plot/Update tax doughnut chart
    const ctx = document.getElementById('taxChart');
    if (!ctx) return;

    if (taxChart) {
        taxChart.data.datasets[0].data = [netPay, tax];
        taxChart.update();
    } else if (typeof Chart !== 'undefined') {
        taxChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Net Take-home Pay', 'Federal Taxes'],
                datasets: [{
                    data: [netPay, tax],
                    backgroundColor: ['#10B981', '#EF4444'],
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
                            font: { family: 'Plus Jakarta Sans', size: 12 },
                            color: '#64748B'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

/* ==========================================
   4. Risk Assessment Quiz
   ========================================== */
let riskChart = null;

function initRiskQuiz() {
    const startBtn = document.getElementById('start-risk-quiz');
    const quizCard = document.getElementById('risk-quiz-card');
    const quizIntro = document.getElementById('risk-quiz-intro');

    if (!startBtn || !quizCard || !quizIntro) return;

    // Show initial questionnaire steps on click
    startBtn.addEventListener('click', () => {
        quizIntro.style.display = 'none';
        quizCard.classList.remove('reveal-hidden');
        showRiskStep(1);
    });

    const nextButtons = document.querySelectorAll('.risk-next-btn');
    const prevButtons = document.querySelectorAll('.risk-prev-btn');

    nextButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = parseInt(btn.getAttribute('data-step'), 10);
            
            // Check if user has answered the question
            const selectedOption = document.querySelector(`input[name="q${currentStep}"]:checked`);
            if (!selectedOption) {
                alert('Please select an option to proceed.');
                return;
            }

            if (currentStep === 5) {
                calculateRiskResult();
            } else {
                showRiskStep(currentStep + 1);
            }
        });
    });

    prevButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentStep = parseInt(btn.getAttribute('data-step'), 10);
            showRiskStep(currentStep - 1);
        });
    });
}

function showRiskStep(stepNum) {
    const steps = document.querySelectorAll('.risk-quiz-step');
    steps.forEach(step => step.classList.remove('active'));

    const activeStep = document.getElementById(`risk-step-${stepNum}`);
    if (activeStep) activeStep.classList.add('active');

    // Update Progress Bar
    const progressFill = document.getElementById('risk-quiz-progress');
    if (progressFill) {
        progressFill.style.width = (stepNum * 20) + '%';
    }
}

function calculateRiskResult() {
    let score = 0;
    for (let q = 1; q <= 5; q++) {
        const option = document.querySelector(`input[name="q${q}"]:checked`);
        if (option) {
            score += parseInt(option.value, 10);
        }
    }

    // Hide steps card and progress bar
    document.getElementById('risk-quiz-card').style.display = 'none';

    // Show Results Panel
    const resultsPanel = document.getElementById('risk-results-panel');
    resultsPanel.classList.add('active');

    let profileName = '';
    let profileDesc = '';
    let allocData = [];
    let allocLabels = [];

    // Profiles based on score (5 - 20)
    if (score <= 8) {
        profileName = 'Conservative Capital Preservation';
        profileDesc = 'Your primary concern is protecting your capital and minimizing downside volatility. You prefer stable cash equivalents and government-grade fixed income bonds.';
        allocLabels = ['Cash / Reserves', 'Govt Bonds', 'Large-cap Equities', 'Gold'];
        allocData = [20, 60, 15, 5];
    } else if (score <= 12) {
        profileName = 'Moderate Balanced Wealth';
        profileDesc = 'You seek moderate growth while shielding your assets from wild market extremes. A typical balance of investment-grade fixed income alongside stable blue-chip companies suits you.';
        allocLabels = ['Cash / Cash equivalents', 'Fixed Income', 'Large-cap Equities', 'International Equities'];
        allocData = [10, 40, 40, 10];
    } else if (score <= 16) {
        profileName = 'Balanced Aggressive Growth';
        profileDesc = 'You are seeking strong capital growth and have a long time horizon. You are comfortable with short-term price adjustments to secure superior long-term stock rewards.';
        allocLabels = ['Corporate Bonds', 'Large-cap Equities', 'International Equities', 'Real Estate / Alternatives'];
        allocData = [15, 50, 20, 15];
    } else {
        profileName = 'Aggressive Equity Growth';
        profileDesc = 'You focus entirely on high compound rates. You tolerate heavy market volatility and wish to allocate majority weighting to small-cap, technology, emerging market stocks, and digital assets.';
        allocLabels = ['Large-cap Equities', 'Mid/Small-cap Equities', 'International Equities', 'Venture Capital / Crypto'];
        allocData = [40, 25, 20, 15];
    }

    // Update Result UI
    document.getElementById('risk-profile-name').textContent = profileName;
    document.getElementById('risk-profile-desc').textContent = profileDesc;

    // Render Doughnut Allocation Chart
    const ctx = document.getElementById('riskAllocChart');
    if (!ctx) return;

    if (riskChart) {
        riskChart.data.labels = allocLabels;
        riskChart.data.datasets[0].data = allocData;
        riskChart.update();
    } else if (typeof Chart !== 'undefined') {
        riskChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: allocLabels,
                datasets: [{
                    data: allocData,
                    backgroundColor: ['#64748B', '#0F6FFF', '#10B981', '#F59E0B'],
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
                            font: { family: 'Plus Jakarta Sans', size: 12 },
                            color: '#64748B'
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    // Bind restart button
    const restartBtn = document.getElementById('restart-risk-quiz');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            // Reset checked inputs
            const checkedInputs = document.querySelectorAll('input[type="radio"]:checked');
            checkedInputs.forEach(input => input.checked = false);

            resultsPanel.classList.remove('active');
            document.getElementById('risk-quiz-card').style.display = 'block';
            document.getElementById('risk-quiz-progress').style.width = '20%';
            showRiskStep(1);
        });
    }
}
