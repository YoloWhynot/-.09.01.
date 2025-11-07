import { users } from './mockDB.js';

export function loginUser(login, password) {
  const user = users.find(u => u.login === login && u.password === password);
  if (user) {
    return { success: true, user };
  }
  return { success: false, error: 'Неверный логин или пароль' };
}

export function registerUser(login, password, name) {
  if (users.find(u => u.login === login)) {
    return { success: false, error: 'Пользователь с таким логином уже существует' };
  }
  const newUser = { id: users.length + 1, login, password, name };
  users.push(newUser); // В реальности сохранять в БД
  return { success: true, user: newUser };
}

export function logoutUser() {
  // Это на будущее, займемся этим потом
  localStorage.removeItem('currentUser');
}

export function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}
