// Функции для главной страницы
function openTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активность у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

// Вход игрока
function loginPlayer() {
    const playerId = document.getElementById('playerId').value.trim();
    
    if (!playerId) {
        alert('Введите ваш ID!');
        return;
    }
    
    // Сохраняем ID игрока
    localStorage.setItem('playerId', playerId);
    
    // Создаем начальный баланс если его нет
    if (!localStorage.getItem(`balance_${playerId}`)) {
        localStorage.setItem(`balance_${playerId}`, '10000');
    }
    
    // Обновляем время последней активности
    localStorage.setItem(`lastActive_${playerId}`, new Date().toLocaleString());
    
    window.location.href = 'games.html';
}
// Вход админа - ПРОСТОЙ ПАРОЛЬ
function loginAdmin() {
    const password = document.getElementById('adminPassword').value;
    
    // ИЗМЕНИ ЭТУ СТРОЧКУ - напиши свой пароль внутри кавычек
    if (password === "tyupi333") {
        const adminData = {
            name: "Администратор",
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(adminData));
        window.location.href = 'admin.html';
    } else {
        alert('Неверный пароль!');
    }
}

