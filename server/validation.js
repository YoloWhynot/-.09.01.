export function validateLogin(login) {
  if (!login || login.length < 3) return 'Логин должен быть не менее 3 символов';
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 6) return 'Пароль должен быть не менее 6 символов';
  return null;
}

export function validateForm(login, password) {
  const loginError = validateLogin(login);
  const passwordError = validatePassword(password);
  return { loginError, passwordError, isValid: !loginError && !passwordError };
}