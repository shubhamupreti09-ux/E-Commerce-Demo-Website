/**
 * Authentication Logic
 */

let currentMode = 'login';

function switchAuthTab(mode) {
    currentMode = mode;
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    const nameGroup = document.getElementById('name-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const nameInput = document.getElementById('auth-name');

    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        nameGroup.classList.add('hidden');
        nameInput.removeAttribute('required');
        submitBtn.textContent = 'Login Securely';
    } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        nameGroup.classList.remove('hidden');
        nameInput.setAttribute('required', 'true');
        submitBtn.textContent = 'Create Account';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // If already logged in, redirect to profile
    if (Store.getUser()) {
        window.location.href = 'profile.html';
        return;
    }

    document.getElementById('auth-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value;

        if (currentMode === 'signup') {
            // Mock signup
            const user = {
                name: name,
                email: email,
                password: password, // Note: For pure mock demo purposes
            };
            Store.setUser(user);
            App.showToast('Account created successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        } else {
            // Mock login
            // For a complete mock, we'll auto-login any user but set their email correctly
            const user = Store.getUser() || { name: 'Customer', email: email };
            user.email = email; // update to whatever they typed
            Store.setUser(user);
            
            App.showToast('Welcome back!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 1000);
        }
    });

    // Support URL param jumping directly to signup
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'signup') {
        switchAuthTab('signup');
    }
});
