function showRegister() {
    document.getElementById('loginForm').classList.add('d-none');
    document.getElementById('registerForm').classList.remove('d-none');
}

function showLogin() {
    document.getElementById('registerForm').classList.add('d-none');
    document.getElementById('loginForm').classList.remove('d-none');
}

function register() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const username = document.getElementById('registerUser').value.trim();
    const password = document.getElementById('registerPass').value.trim();
    
    if (!username || !password) {
        alert('Todos los campos son requeridos');
        return;
    }
    
    if (users.some(u => u.username === username)) {
        alert('El usuario ya existe');
        return;
    }
    
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registro exitoso. Por favor, inicia sesión.');
    showLogin();
}

function login() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.location.href = 'pokedex.html'; 
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

function loadDashboard() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!loggedInUser) {
      
        window.location.href = 'index.html';
        return;
    }
    
   
    document.getElementById('usernameHeader').textContent = loggedInUser.username;
}

function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}