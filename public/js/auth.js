document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await fetchWithAuth('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        document.getElementById('auth-status').innerText = `Logged in as ${data.user.email}`;
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'block';
        
        if(data.user.role === 'admin') {
            document.getElementById('admin-section').style.display = 'block';
        }
        
        alert('Login successful');
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
});
