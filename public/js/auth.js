const API_BASE = '/api';

async function loginUser(login, password) {
  const res = await fetch(`${API_BASE}/users`);
  const users = await res.json();
  const user = users.find(u => u.login === login && u.password === password);
  if (!user) return { success: false, error: 'Неверный логин или пароль' };
  localStorage.setItem('currentUserId', user.id);
  return { success: true, user };        // ← теперь внутри user есть role
}

async function registerUser(login, password, name) {
  const res = await fetch(`${API_BASE}/users`);
  const users = await res.json();
  if (users.find(u => u.login === login)) return { success: false, error: 'Логин занят' };
  const newUser = { login, password, name, role: 'user' }; // ← role явно прописан
  const createRes = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser)
  });
  const result = await createRes.json();
  if (result.success) localStorage.setItem('currentUserId', result.user.id);
  return result;
}

export async function getCurrentUser() {
  const id = localStorage.getItem('currentUserId');
  if (!id) return null;
  const res = await fetch('/api/users');
  const users = await res.json();
  return users.find(u => u.id == id) || null;
}

export function logoutUser() {
  localStorage.removeItem('currentUserId');
}

const form = document.getElementById('authForm');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const login = form.login.value.trim();
    const password = form.password.value.trim();
    const firstName = form.firstName?.value.trim();
    const isLogin = !firstName;

    const res = isLogin
      ? await loginUser(login, password)
      : await registerUser(login, password, firstName);

    if (res.success) {
      alert(isLogin ? 'Вход выполнен!' : 'Регистрация завершена!');
      location.href = isLogin
        ? (res.user.role === 'admin' ? 'admin.html' : 'index.html')
        : 'auth.html';
    } else {
      alert(res.error);
    }
  });
}