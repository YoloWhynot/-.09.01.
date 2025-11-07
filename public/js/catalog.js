const API_BASE = '/api';

export async function loadProducts() {
  const res = await fetch(`${API_BASE}/products`);
  return res.json();
}

export function renderProductCard(product) {
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <h3>${product.name}</h3>
      <p class="product-price">${product.price} ₽</p>
      <div class="product-rating">★★★★★</div>
    </div>
  `;
}

export async function renderProductList(container) {
  try {
    const products = await loadProducts();
    if (!Array.isArray(products) || products.length === 0) {
      container.innerHTML = '<p>Товары не найдены</p>';
      return;
    }
    container.innerHTML = products.map(renderProductCard).join('');
    container.querySelectorAll('.product-card').forEach(card => {
      card.onclick = () => location.href = `product.html?id=${card.dataset.id}`;
    });
  } catch {
    container.innerHTML = '<p>Ошибка загрузки товаров</p>';
  }
}