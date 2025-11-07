const API_BASE = '/api';

async function loadProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) return null;
  return res.json();
}

function renderProduct(product) {
  document.querySelector('.product-title').textContent = product.name;
  document.querySelector('.product-price-large').textContent = `${product.price} ₽`;
  document.querySelector('.product-description').textContent = product.description;
  document.querySelector('.main-image img').src = product.image;
  document.title = `FunkWave - ${product.name}`;
}

(async () => {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) return;

  const product = await loadProduct(id);
  if (product) renderProduct(product);
  else {
    alert('Товар не найден');
    location.href = 'catalog.html';
  }
})();