// Simple SHA-256 hash function (for password hashing)
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Initialize default admin credentials if not set
function initAdminCredentials() {
    if (!localStorage.getItem('adminHash')) {
        // Default password: admin123 (change this!)
        sha256('admin123').then(hash => {
            localStorage.setItem('adminHash', hash);
            localStorage.setItem('adminUsername', 'admin');
        });
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return sessionStorage.getItem('adminAuthenticated') === 'true';
}

// Login function
async function login(username, password) {
    const storedUsername = localStorage.getItem('adminUsername') || 'admin';
    const storedHash = localStorage.getItem('adminHash');
    
    if (!storedHash) {
        initAdminCredentials();
        return false;
    }
    
    if (username !== storedUsername) {
        return false;
    }
    
    const passwordHash = await sha256(password);
    if (passwordHash === storedHash) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        return true;
    }
    
    return false;
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminLoginTime');
    window.location.href = 'admin-login.html';
}

// Change password function
async function changePassword(oldPassword, newPassword) {
    const storedHash = localStorage.getItem('adminHash');
    const oldPasswordHash = await sha256(oldPassword);
    
    if (oldPasswordHash !== storedHash) {
        return false;
    }
    
    const newPasswordHash = await sha256(newPassword);
    localStorage.setItem('adminHash', newPasswordHash);
    return true;
}

// Check session timeout (8 hours)
function checkSessionTimeout() {
    const loginTime = sessionStorage.getItem('adminLoginTime');
    if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime);
        const eightHours = 8 * 60 * 60 * 1000;
        if (elapsed > eightHours) {
            logout();
        }
    }
}

// Initialize on page load
if (document.getElementById('loginForm')) {
    initAdminCredentials();
    
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMsg = document.getElementById('errorMessage');
        
        errorMsg.textContent = '';
        errorMsg.style.display = 'none';
        
        const success = await login(username, password);
        if (success) {
            window.location.href = 'admin-dashboard.html';
        } else {
            errorMsg.textContent = 'Invalid username or password';
            errorMsg.style.display = 'block';
        }
    });
    
    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this;
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.remove('bx-hide');
            icon.classList.add('bx-show');
        } else {
            passwordInput.type = 'password';
            icon.classList.remove('bx-show');
            icon.classList.add('bx-hide');
        }
    });
}

// Check authentication on protected pages
if (window.location.pathname.includes('admin-dashboard') || window.location.href.includes('admin-dashboard')) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuth);
    } else {
        checkAuth();
    }
}

function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'admin-login.html';
    } else {
        checkSessionTimeout();
        // Refresh session timeout check every minute
        setInterval(checkSessionTimeout, 60000);
    }
}

