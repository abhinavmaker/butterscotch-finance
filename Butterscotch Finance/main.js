let bills = [];
let currentSort = 'dueDate';

document.addEventListener('DOMContentLoaded', () => {
    loadBills();
    setupNavigation();
    setupForm();
    setupSort();
    updateDashboard();
});

function setupSort() {
    const sortSelect = document.getElementById('sortSelect');
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderUpcoming();
    });
}

function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const pageName = e.target.dataset.page;
            showPage(pageName);
        });
    });
}

function showPage(pageName) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(pageName).classList.add('active');
    
    if (pageName === 'bills') {
        renderBillsList();
    } else if (pageName === 'dashboard') {
        updateDashboard();
    }
}

function setupForm() {
    const billForm = document.getElementById('billForm');
    const toggleBtn = document.getElementById('toggleFormBtn');
    const cancelBtn = document.getElementById('cancelFormBtn');

    toggleBtn.addEventListener('click', () => {
        billForm.classList.toggle('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        billForm.classList.add('hidden');
        billForm.reset();
    });

    billForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newBill = {
            id: Date.now(),
            name: document.getElementById('billName').value,
            amount: parseFloat(document.getElementById('billAmount').value),
            frequency: document.getElementById('billFrequency').value,
            dueDate: parseInt(document.getElementById('billDueDate').value)
        };

        bills.push(newBill);
        saveBills();
        billForm.reset();
        billForm.classList.add('hidden');
        renderBillsList();
    });
}

function loadBills() {
    const saved = localStorage.getItem('bills');
    bills = saved ? JSON.parse(saved) : [];
}

function saveBills() {
    localStorage.setItem('bills', JSON.stringify(bills));
}

function updateDashboard() {
    const monthlyTotal = bills.reduce((sum, bill) => {
        const monthlyAmount = getMonthlyAmount(bill.amount, bill.frequency);
        return sum + monthlyAmount;
    }, 0);

    const highestBill = bills.length > 0 ? Math.max(...bills.map(b => b.amount)) : 0;
    const avgBill = bills.length > 0 ? monthlyTotal / bills.length : 0;

    document.getElementById('monthlyTotal').textContent = `$${monthlyTotal.toFixed(2)}`;
    document.getElementById('billCount').textContent = bills.length;
    document.getElementById('highestBill').textContent = `$${highestBill.toFixed(2)}`;
    document.getElementById('avgBill').textContent = `$${avgBill.toFixed(2)}`;
    
    renderUpcoming();
    renderCharts();
}

function getMonthlyAmount(amount, frequency) {
    const frequencies = {
        'weekly': amount * 4.33,
        'biweekly': amount * 2.17,
        'monthly': amount,
        'quarterly': amount / 3,
        'yearly': amount / 12
    };
    return frequencies[frequency] || amount;
}

function renderUpcoming() {
    const upcomingContainer = document.getElementById('upcomingBills');
    
    if (bills.length === 0) {
        upcomingContainer.innerHTML = '<div class="empty-state"><p class="empty-state-text">No bills added yet</p></div>';
        return;
    }

    let sorted = [...bills];
    const today = new Date().getDate();

    if (currentSort === 'dueDate') {
        sorted.sort((a, b) => a.dueDate - b.dueDate);
    } else if (currentSort === 'price') {
        sorted.sort((a, b) => b.amount - a.amount);
    } else if (currentSort === 'closest') {
        sorted.sort((a, b) => {
            const aDist = a.dueDate >= today ? a.dueDate - today : 30 - today + a.dueDate;
            const bDist = b.dueDate >= today ? b.dueDate - today : 30 - today + b.dueDate;
            return aDist - bDist;
        });
    } else if (currentSort === 'dateAdded') {
        sorted.sort((a, b) => a.id - b.id);
    }
    
    const upcoming = sorted.slice(0, 5);
    
    upcomingContainer.innerHTML = upcoming.map(bill => `
        <div class="upcoming-item">
            <div class="upcoming-item-info">
                <div class="upcoming-item-name">${bill.name}</div>
                <div class="upcoming-item-detail">Due on ${getDayWithSuffix(bill.dueDate)} - ${formatFrequency(bill.frequency)}</div>
            </div>
            <div class="upcoming-item-amount">$${bill.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderCharts() {
    renderFrequencyChart();
    renderAmountChart();
}

function renderFrequencyChart() {
    const freqCount = {};
    bills.forEach(bill => {
        freqCount[bill.frequency] = (freqCount[bill.frequency] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(freqCount), 1);
    
    const chart = document.getElementById('frequencyChart');
    chart.innerHTML = Object.entries(freqCount).map(([freq, count]) => `
        <div class="chart-row">
            <div class="chart-label">${formatFrequency(freq)}</div>
            <div class="chart-bar-container">
                <div class="chart-bar" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <div class="chart-value">${count}</div>
        </div>
    `).join('');
}

function renderAmountChart() {
    if (bills.length === 0) {
        document.getElementById('amountChart').innerHTML = '<div class="empty-state"><p class="empty-state-text">No data</p></div>';
        return;
    }

    const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
    const colors = ['#ff6b5b', '#6c7aa8', '#2d2d44', '#ffa366', '#99b3d9', '#4d4d66', '#ff8f7b'];
    
    let currentAngle = -90;
    const svgSegments = bills.map((bill, index) => {
        const percentage = (bill.amount / totalAmount) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = 100 + 80 * Math.cos(startRad);
        const y1 = 100 + 80 * Math.sin(startRad);
        const x2 = 100 + 80 * Math.cos(endRad);
        const y2 = 100 + 80 * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        let path;
        if (angle === 360) {
            path = `M 100 20 A 80 80 0 1 1 99.9 20`;
        } else {
            path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;
        }
        
        const labelAngle = startAngle + angle / 2;
        const labelRad = (labelAngle * Math.PI) / 180;
        const labelX = 100 + 50 * Math.cos(labelRad);
        const labelY = 100 + 50 * Math.sin(labelRad);
        
        currentAngle = endAngle;
        
        return {
            path,
            color: colors[index % colors.length],
            percentage,
            labelX,
            labelY,
            name: bill.name,
            amount: bill.amount
        };
    });

    const svg = `
        <svg width="280" height="280" viewBox="0 0 200 200" style="max-width: 100%;">
            ${svgSegments.map(seg => `<path d="${seg.path}" fill="${seg.color}" stroke="white" stroke-width="2"/>`).join('')}
            ${svgSegments.map(seg => `<text x="${seg.labelX}" y="${seg.labelY}" text-anchor="middle" dy="0.3em" font-size="11" font-weight="600" fill="white">${seg.percentage.toFixed(0)}%</text>`).join('')}
        </svg>
        <div class="pie-legend">
            ${svgSegments.map((seg, i) => `
                <div class="legend-item">
                    <div class="legend-color" style="background: ${seg.color}"></div>
                    <div class="legend-text">
                        <div>${seg.name}</div>
                        <div class="legend-amount">$${seg.amount.toFixed(2)}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    document.getElementById('amountChart').innerHTML = svg;
}

function renderBillsList() {
    const billsContainer = document.getElementById('billsList');
    
    if (bills.length === 0) {
        billsContainer.innerHTML = '<div class="empty-state"><p class="empty-state-text">No bills yet. Add one to get started!</p></div>';
        return;
    }

    billsContainer.innerHTML = bills.map(bill => `
        <div class="bill-card">
            <div class="bill-info">
                <div class="bill-name">${bill.name}</div>
                <div class="bill-details">
                    <span>Due: ${getDayWithSuffix(bill.dueDate)}</span>
                    <span>${formatFrequency(bill.frequency)}</span>
                </div>
            </div>
            <div class="bill-amount">$${bill.amount.toFixed(2)}</div>
            <button class="delete-btn" onclick="deleteBill(${bill.id})">Delete</button>
        </div>
    `).join('');
}

function deleteBill(id) {
    bills = bills.filter(bill => bill.id !== id);
    saveBills();
    updateDashboard();
    renderBillsList();
}

function getDayWithSuffix(day) {
    if (day > 3 && day < 21) return day + 'th';
    switch (day % 10) {
        case 1: return day + 'st';
        case 2: return day + 'nd';
        case 3: return day + 'rd';
        default: return day + 'th';
    }
}

function formatFrequency(freq) {
    const map = {
        'weekly': 'Weekly',
        'biweekly': 'Bi-weekly',
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'yearly': 'Yearly'
    };
    return map[freq] || freq;
}
