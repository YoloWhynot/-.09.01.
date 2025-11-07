import { validateForm } from './validation.js';
import { loginUser, registerUser } from './auth.js';
import { products } from './mockDB.js';

// --- Авторизация / регистрация ---
if (document.querySelector('.auth-form')) {
  const form = document.querySelector('.auth-form');
  const isLogin = document.title.includes('Вход');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;

    const { isValid, loginError, passwordError } = validateForm(email, password);
    if (!isValid) {
      alert(`${loginError || ''} ${passwordError || ''}`);
      return;
    }

    const result = isLogin
      ? loginUser(email, password)
      : registerUser(email, password, form.querySelector('#firstName')?.value || '');

    if (result.success) {
      alert(isLogin ? 'Вход успешен!' : 'Регистрация успешна!');
      window.location.href = 'catalog.html';
    } else {
      alert(result.error);
    }
  });
}

// --- Загрузка товаров на catalog.html ---
if (document.querySelector('.products-grid') && window.location.pathname.includes('catalog.html')) {
  const container = document.querySelector('.products-grid');
  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => (window.location.href = `product.html?id=${product.id}`);

    card.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <h3>${product.name}</h3>
      <p class="product-price">${product.price} ₽</p>
      <div class="product-rating">★★★★☆</div>
    `;

    container.appendChild(card);
  });
}

// --- Загрузка товара на product.html ---
if (document.querySelector('.product-detail')) {
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  const product = products.find(p => p.id === productId);

  if (product) {
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.main-image img').src = product.image;
    document.querySelector('.product-price-large').textContent = `${product.price} ₽`;
    document.querySelector('.product-description').textContent = product.description;
  } else {
    alert('Товар не найден');
    window.location.href = 'catalog.html';
  }
}