document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.querySelector('.login-btn');

    // Retrieve saved username if remembered
    if (localStorage.getItem('rememberedUsername')) {
        usernameInput.value = localStorage.getItem('rememberedUsername');
        document.getElementById('rememberMe').checked = true;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset error state
        loginError.classList.remove('active');
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Button loading state
        const originalBtnText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Authenticating...</span>';
        loginBtn.disabled = true;

        // Network request
        fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message === 'Login successful') {
                // Handle remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedUsername', username);
                } else {
                    localStorage.removeItem('rememberedUsername');
                }
                
                // Set authenticated flag
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('userRole', data.role);
                
                // Add success animation to container
                document.querySelector('.login-container').style.transform = 'scale(0.95)';
                document.querySelector('.login-container').style.opacity = '0';
                
                // Redirect to main dashboard
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 300);
            } else {
                // Show error
                loginError.textContent = data.error || 'Invalid username or password.';
                loginError.classList.add('active');
                
                // Reset button
                loginBtn.innerHTML = originalBtnText;
                loginBtn.disabled = false;
                
                // Clear password for security
                passwordInput.value = '';
                passwordInput.focus();
            }
        })
        .catch(err => {
            console.error('Login error:', err);
            loginError.textContent = 'Failed to connect. Please try again.';
            loginError.classList.add('active');
            loginBtn.innerHTML = originalBtnText;
            loginBtn.disabled = false;
        });
    });
});
