document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username,
        password,
      }),
    });

    if (response.ok) {
      window.location.href = '/';
    } else {
      alert('Registration failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});
