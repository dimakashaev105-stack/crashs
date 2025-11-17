// Конфигурация
const ADMIN_PASSWORD = "cary"; // Смени на свой пароль
let currentAdmin = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadAdminData();
});

// Проверка авторизации
function checkAdminAuth() {
    const admin = localStorage.getItem('adminAuth');
    if (!admin) {
        window.location.href = 'index.html';
        return;
    }
    currentAdmin = JSON.parse(admin);
    document.getElementById('adminStatus').textContent = `Админ: ${currentAdmin.name}`;
}

// Вход админа
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        const adminData = {
            name: "Главный администратор",
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(adminData));
        window.location.href = 'admin.html';
    } else {
        alert('Неверный пароль!');
    }
}

// Управление вкладками
function openAdminTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активность у всех кнопок
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Загрузить данные для вкладки
    switch(tabName) {
        case 'users':
            loadUsersList();
            break;
        case 'withdrawals':
            loadWithdrawals();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'games':
            loadGameStats();
            break;
    }
}

// Загрузка списка пользователей
function loadUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    // Получаем всех пользователей из localStorage
    const users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('balance_')) {
            const userId = key.replace('balance_', '');
            const balance = localStorage.getItem(key);
            const userData = {
                id: userId,
                balance: parseInt(balance),
                lastActive: localStorage.getItem(`lastActive_${userId}`) || 'Неизвестно'
            };
            users.push(userData);
        }
    }
    
    if (users.length === 0) {
        usersList.innerHTML = '<div class="user-item">Пользователи не найдены</div>';
        return;
    }
    
    users.forEach(user => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>ID: ${user.id}</strong><br>
                    <span>Баланс: ${user.balance.toLocaleString()}₽</span><br>
                    <small>Последняя активность: ${user.lastActive}</small>
                </div>
                <div>
                    <button onclick="manageUser('${user.id}')" class="btn-primary">Управлять</button>
                </div>
            </div>
        `;
        usersList.appendChild(userItem);
    });
}

// Поиск пользователя
function searchUser() {
    const searchTerm = document.getElementById('userSearch').value.trim();
    if (!searchTerm) {
        loadUsersList();
        return;
    }
    
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    // Ищем пользователя
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('balance_')) {
            const userId = key.replace('balance_', '');
            if (userId.includes(searchTerm)) {
                const balance = localStorage.getItem(key);
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>ID: ${userId}</strong><br>
                            <span>Баланс: ${parseInt(balance).toLocaleString()}₽</span>
                        </div>
                        <div>
                            <button onclick="manageUser('${userId}')" class="btn-primary">Управлять</button>
                        </div>
                    </div>
                `;
                usersList.appendChild(userItem);
                found = true;
            }
        }
    }
    
    if (!found) {
        usersList.innerHTML = '<div class="user-item">Пользователь не найден</div>';
    }
}

// Управление пользователем
function manageUser(userId) {
    document.getElementById('manageUserId').value = userId;
    const balance = localStorage.getItem(`balance_${userId}`) || 0;
    document.getElementById('manageAmount').placeholder = `Текущий баланс: ${parseInt(balance).toLocaleString()}₽`;
}

// Пополнение баланса
function addBalance() {
    const userId = document.getElementById('manageUserId').value;
    const amount = parseInt(document.getElementById('manageAmount').value);
    
    if (!userId || !amount || amount <= 0) {
        alert('Заполните все поля корректно!');
        return;
    }
    
    const currentBalance = parseInt(localStorage.getItem(`balance_${userId}`) || 0);
    const newBalance = currentBalance + amount;
    localStorage.setItem(`balance_${userId}`, newBalance);
    
    // Записываем транзакцию
    recordTransaction(userId, 'deposit', amount, `Админ пополнение`);
    
    alert(`Баланс пользователя ${userId} пополнен на ${amount.toLocaleString()}₽`);
    document.getElementById('manageAmount').value = '';
    loadUsersList();
}

// Списание баланса
function removeBalance() {
    const userId = document.getElementById('manageUserId').value;
    const amount = parseInt(document.getElementById('manageAmount').value);
    
    if (!userId || !amount || amount <= 0) {
        alert('Заполните все поля корректно!');
        return;
    }
    
    const currentBalance = parseInt(localStorage.getItem(`balance_${userId}`) || 0);
    if (amount > currentBalance) {
        alert('Недостаточно средств на балансе!');
        return;
    }
    
    const newBalance = currentBalance - amount;
    localStorage.setItem(`balance_${userId}`, newBalance);
    
    // Записываем транзакцию
    recordTransaction(userId, 'withdrawal', amount, `Админ списание`);
    
    alert(`С баланса пользователя ${userId} списано ${amount.toLocaleString()}₽`);
    document.getElementById('manageAmount').value = '';
    loadUsersList();
}

// Установка баланса
function setBalance() {
    const userId = document.getElementById('manageUserId').value;
    const amount = parseInt(document.getElementById('manageAmount').value);
    
    if (!userId || !amount || amount < 0) {
        alert('Заполните все поля корректно!');
        return;
    }
    
    const oldBalance = parseInt(localStorage.getItem(`balance_${userId}`) || 0);
    localStorage.setItem(`balance_${userId}`, amount);
    
    // Записываем транзакцию
    const difference = amount - oldBalance;
    if (difference !== 0) {
        recordTransaction(userId, difference > 0 ? 'deposit' : 'withdrawal', 
                         Math.abs(difference), `Админ установка баланса`);
    }
    
    alert(`Баланс пользователя ${userId} установлен: ${amount.toLocaleString()}₽`);
    document.getElementById('manageAmount').value = '';
    loadUsersList();
}

// Загрузка заявок на вывод
function loadWithdrawals() {
    const withdrawalsList = document.getElementById('withdrawalsList');
    withdrawalsList.innerHTML = '';
    
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
    
    if (withdrawals.length === 0) {
        withdrawalsList.innerHTML = '<div class="withdrawal-item">Заявок на вывод нет</div>';
        return;
    }
    
    // Сортируем по дате (новые сначала)
    withdrawals.sort((a, b) => b.id - a.id);
    
    withdrawals.forEach(withdrawal => {
        const item = document.createElement('div');
        item.className = `withdrawal-item ${withdrawal.status}`;
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>ID: ${withdrawal.playerId}</strong><br>
                    <span>Сумма: ${withdrawal.amount.toLocaleString()}₽</span><br>
                    <small>Дата: ${withdrawal.date}</small><br>
                    <span class="status-badge">Статус: ${getStatusText(withdrawal.status)}</span>
                </div>
                <div>
                    ${withdrawal.status === 'pending' ? `
                        <button onclick="approveWithdrawal(${withdrawal.id})" class="btn-success">✅ Одобрить</button>
                        <button onclick="rejectWithdrawal(${withdrawal.id})" class="btn-danger">❌ Отклонить</button>
                    ` : ''}
                </div>
            </div>
        `;
        withdrawalsList.appendChild(item);
    });
}

function getStatusText(status) {
    const statuses = {
        'pending': '⏳ Ожидание',
        'approved': '✅ Одобрено', 
        'rejected': '❌ Отклонено'
    };
    return statuses[status] || status;
}

// Одобрение вывода
function approveWithdrawal(withdrawalId) {
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    
    if (withdrawal) {
        withdrawal.status = 'approved';
        withdrawal.processedBy = currentAdmin.name;
        withdrawal.processedAt = new Date().toLocaleString();
        
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
        
        // Записываем транзакцию
        recordTransaction(withdrawal.playerId, 'withdrawal_approved', 
                         withdrawal.amount, `Вывод средств`);
        
        alert('Заявка одобрена!');
        loadWithdrawals();
    }
}

// Отклонение вывода
function rejectWithdrawal(withdrawalId) {
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
    const withdrawal = withdrawals.find(w => w.id === withdrawalId);
    
    if (withdrawal) {
        // Возвращаем средства
        const currentBalance = parseInt(localStorage.getItem(`balance_${withdrawal.playerId}`) || 0);
        localStorage.setItem(`balance_${withdrawal.playerId}`, currentBalance + withdrawal.amount);
        
        withdrawal.status = 'rejected';
        withdrawal.processedBy = currentAdmin.name;
        withdrawal.processedAt = new Date().toLocaleString();
        
        localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
        
        // Записываем транзакцию
        recordTransaction(withdrawal.playerId, 'withdrawal_rejected', 
                         withdrawal.amount, `Возврат при отклонении вывода`);
        
        alert('Заявка отклонена! Средства возвращены пользователю.');
        loadWithdrawals();
    }
}

// Загрузка транзакций
function loadTransactions() {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';
    
    const filter = document.getElementById('transactionFilter').value;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    let filteredTransactions = transactions;
    if (filter !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filter);
    }
    
    if (filteredTransactions.length === 0) {
        transactionsList.innerHTML = '<div class="transaction-item">Транзакций не найдено</div>';
        return;
    }
    
    // Сортируем по дате (новые сначала)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    filteredTransactions.forEach(transaction => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>ID: ${transaction.userId}</strong><br>
                    <span>Тип: ${getTransactionTypeText(transaction.type)}</span><br>
                    <span>Сумма: ${transaction.amount.toLocaleString()}₽</span><br>
                    <small>${transaction.description}</small><br>
                    <small>${new Date(transaction.timestamp).toLocaleString()}</small>
                </div>
                <div style="color: ${transaction.amount >= 0 ? '#28a745' : '#dc3545'}; font-weight: bold;">
                    ${transaction.amount >= 0 ? '+' : ''}${transaction.amount.toLocaleString()}₽
                </div>
            </div>
        `;
        transactionsList.appendChild(item);
    });
}

function getTransactionTypeText(type) {
    const types = {
        'deposit': '📥 Пополнение',
        'withdrawal': '📤 Вывод',
        'game': '🎮 Игра',
        'withdrawal_approved': '✅ Вывод одобрен',
        'withdrawal_rejected': '❌ Вывод отклонен'
    };
    return types[type] || type;
}

// Запись транзакции
function recordTransaction(userId, type, amount, description) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    transactions.push({
        userId: userId,
        type: type,
        amount: amount,
        description: description,
        timestamp: Date.now()
    });
    
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Загрузка статистики игр
function loadGameStats() {
    // Здесь можно добавить сбор статистики по играм
    const totalBets = JSON.parse(localStorage.getItem('totalBets') || '0');
    const totalWins = JSON.parse(localStorage.getItem('totalWins') || '0');
    const houseProfit = JSON.parse(localStorage.getItem('houseProfit') || '0');
    
    document.getElementById('totalBets').textContent = parseInt(totalBets).toLocaleString();
    document.getElementById('totalWins').textContent = parseInt(totalWins).toLocaleString();
    document.getElementById('houseProfit').textContent = parseInt(houseProfit).toLocaleString() + '₽';
}

// Обновление настроек Crash игры
function updateCrashSettings() {
    const maxMultiplier = document.getElementById('crashMaxMultiplier').value;
    const commission = document.getElementById('crashCommission').value;
    
    localStorage.setItem('crashMaxMultiplier', maxMultiplier);
    localStorage.setItem('crashCommission', commission);
    
    alert('Настройки Crash игры сохранены!');
}

// Обновление настроек слотов
function updateSlotsSettings() {
    const rtp = document.getElementById('slotsRTP').value;
    const jackpot = document.getElementById('slotsJackpot').value;
    
    localStorage.setItem('slotsRTP', rtp);
    localStorage.setItem('slotsJackpot', jackpot);
    
    alert('Настройки слотов сохранены!');
}

// Выход
function logout() {
    localStorage.removeItem('adminAuth');
    window.location.href = 'index.html';
}

// Загрузка данных админки
function loadAdminData() {
    // Загружаем настройки игр
    document.getElementById('crashMaxMultiplier').value = localStorage.getItem('crashMaxMultiplier') || '100';
    document.getElementById('crashCommission').value = localStorage.getItem('crashCommission') || '5';
    document.getElementById('slotsRTP').value = localStorage.getItem('slotsRTP') || '95';
    document.getElementById('slotsJackpot').value = localStorage.getItem('slotsJackpot') || '1000000';
        }
