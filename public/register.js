document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerError = document.getElementById('registerError');
    const registerBtn = document.querySelector('.login-btn');
    const roleInputs = document.querySelectorAll('input[name="role"]');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset error state
        registerError.classList.remove('active');
        registerError.style.color = '#ff6b6b';
        registerError.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
        registerError.style.border = '1px solid rgba(255, 107, 107, 0.2)';
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let role = 'staff';
        roleInputs.forEach(input => {
            if (input.checked) {
                role = input.value;
            }
        });

        if (password !== confirmPassword) {
            registerError.textContent = 'Passwords do not match.';
            registerError.classList.add('active');
            return;
        }

        // Button loading state
        const originalBtnText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Registering...</span>';
        registerBtn.disabled = true;

        // Network request
        fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password, role })
        })
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
            if (status === 201) {
                // Show success message
                registerError.textContent = 'Registration successful! Redirecting to login...';
                registerError.style.color = '#4CAF50';
                registerError.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                registerError.style.border = '1px solid rgba(76, 175, 80, 0.2)';
                registerError.classList.add('active');
                
                // Add success animation to container
                setTimeout(() => {
                    document.querySelector('.login-container').style.transform = 'scale(0.95)';
                    document.querySelector('.login-container').style.opacity = '0';
                    
                    // Redirect to login page
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 300);
                }, 1500);
            } else {
                // Show error
                registerError.textContent = data.error || 'Registration failed.';
                registerError.classList.add('active');
                
                // Reset button
                registerBtn.innerHTML = originalBtnText;
                registerBtn.disabled = false;
            }
        })
        .catch(err => {
            console.error('Registration error:', err);
            registerError.textContent = 'Failed to connect. Please try again.';
            registerError.classList.add('active');
            registerBtn.innerHTML = originalBtnText;
            registerBtn.disabled = false;
        });
    });
});
