const SUPABASE_URL = 'https://nekbhxolrzcpriyfzxjw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5la2JoeG9scnpjcHJpeWZ6eGp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5MTk1MDEsImV4cCI6MjA3NDQ5NTUwMX0._MWD_STkbuJlDvRONLtl_oD33DJbe7Q6FIvYhX7rqPQ';
const BUCKET = 'Img for mdk';

const API_BASE = '/api';
import { getCurrentUser, logoutUser } from './auth.js';

let users = [];
let products = [];

document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert('Доступ запрещён');
    location.href = 'index.html';
    return;
  }
  initTabs();
  await loadData();
});

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

async function loadData() {
  users = await (await fetch(`${API_BASE}/users`)).json();
  products = await (await fetch(`${API_BASE}/products`)).json();
  renderUsers();
  renderProducts();
}

function renderUsers() {
  const container = document.getElementById('usersCards');
  container.innerHTML = users.map(u => `
    <div class="card">
      <h3>${u.name}</h3>
      <p>Логин: ${u.login}</p>
      <p>Роль: ${u.role}</p>
      <div class="card-actions">
        <button onclick="editUser(${u.id})">Редактировать</button>
        <button onclick="deleteUser(${u.id})">Удалить</button>
      </div>
    </div>
  `).join('');
}

function renderProducts() {
  const container = document.getElementById('productsCards');
  container.innerHTML = products.map(p => `
    <div class="card">
      <img src="${p.image}" alt="${p.name}" />
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p><strong>${p.price} ₽</strong></p>
      <div class="card-actions">
        <button onclick="editProduct(${p.id})">Редактировать</button>
        <button onclick="deleteProduct(${p.id})">Удалить</button>
      </div>
    </div>
  `).join('');
}

window.deleteUser = async id => {
  if (!confirm('Удалить пользователя?')) return;
  await fetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  await loadData();
};

window.deleteProduct = async id => {
  if (!confirm('Удалить товар?')) return;
  await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
  await loadData();
};

window.editUser = id => openModal('user', users.find(u => u.id === id));
window.editProduct = id => openModal('product', products.find(p => p.id === id));

document.getElementById('addUserBtn').onclick = () => openModal('user');
document.getElementById('addProductBtn').onclick = () => openModal('product');

async function uploadImage(file) {
  const name = `${Date.now()}_${file.name}`.replace(/\s+/g, '_');
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(BUCKET)}/${name}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON}`,
      'Content-Type': file.type
    },
    body: file
  });
  if (!res.ok) throw new Error('Ошибка загрузки ' + res.status);
  return `${SUPABASE_URL}/storage/v1/object/public/${encodeURIComponent(BUCKET)}/${name}`;
}

function openModal(type, item = null) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('modalForm');
  form.innerHTML = '';
  form.dataset.type = type;
  form.dataset.id = item?.id || '';

  if (type === 'user') {
    title.textContent = item ? 'Редактировать пользователя' : 'Добавить пользователя';
    form.innerHTML = `
      <input name="name" placeholder="Имя" required value="${item?.name || ''}" />
      <input name="login" placeholder="Логин" required value="${item?.login || ''}" />
      <input name="password" type="password" placeholder="${item ? 'Новый пароль (оставь пустым, если не менять)' : 'Пароль'}" />
      <select name="role">
        <option value="user" ${item?.role === 'user' ? 'selected' : ''}>Пользователь</option>
        <option value="admin" ${item?.role === 'admin' ? 'selected' : ''}>Админ</option>
      </select>
      <button type="submit">Сохранить</button>
    `;
  } else {
    title.textContent = item ? 'Редактировать товар' : 'Добавить товар';
    form.innerHTML = `
      <input name="name" placeholder="Название" required value="${item?.name || ''}" />
      <textarea name="description" placeholder="Описание" required>${item?.description || ''}</textarea>
      <input name="price" type="number" placeholder="Цена" required value="${item?.price || ''}" />
      <input type="file" id="imageFile" accept="image/*">
      <img id="preview" src="${item?.image || ''}" alt="preview" style="max-width:100%;margin-top:10px;${item?.image ? 'display:block' : 'display:none'};">
      <button type="submit">Сохранить</button>
    `;

    const fileInp = form.querySelector('#imageFile');
    const preview = form.querySelector('#preview');
    fileInp?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    });
  }

  form.onsubmit = async e => {
    e.preventDefault();
    const file = form.imageFile?.files[0];
    let imageUrl = form.image?.value?.trim() || '';

    if (file) {
      try {
        imageUrl = await uploadImage(file);
      } catch (err) {
        alert(err.message);
        return;
      }
    }

    const data = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      price: Number(form.price.value),
      image: imageUrl,
      ...(type === 'user' && {
        login: form.login.value.trim(),
        name: form.name.value.trim(),
        role: form.role.value,
        ...(form.password.value && { password: form.password.value })
      })
    };

    const id = form.dataset.id;
    const url = `${API_BASE}/${type}s${id ? '/' + id : ''}`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) alert('Ошибка сохранения');
    modal.style.display = 'none';
    await loadData();
  };

  modal.style.display = 'flex';
}

document.querySelector('.close').onclick = () => {
  document.getElementById('modal').style.display = 'none';
};

document.getElementById('logout').onclick = e => {
  e.preventDefault();
  logoutUser();
  location.href = 'index.html';
};