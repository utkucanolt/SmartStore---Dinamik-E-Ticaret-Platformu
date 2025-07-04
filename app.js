window.onload = () => {
  checkLogin();
  loadDarkMode();
  loadCategories();
  loadProducts();
  setupEventListeners();
};

// ✅ Giriş Kontrolü
function checkLogin() {
  const user = localStorage.getItem('loggedInUser');
  const welcomeMsg = document.getElementById('welcomeMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!user) {
    if (window.location.pathname.includes('index.html')) {
      window.location.href = 'login.html';
    }
  } else {
    if (welcomeMsg) welcomeMsg.textContent = `Hoşgeldin, ${user}!`;
    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.onclick = () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
      };
    }
  }
}

// ✅ Koyu Mod
function loadDarkMode() {
  const darkModeBtn = document.getElementById('darkModeBtn');
  if (!darkModeBtn) return;

  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    darkModeBtn.textContent = '☀️ Açık Mod';
  }

  darkModeBtn.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeBtn.textContent = isDark ? '☀️ Açık Mod' : '🌙 Koyu Mod';
  };
}

// ✅ Login Validasyonu — Buraya eklendi
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const kullaniciAdi = document.getElementById('kullaniciAdi').value.trim();
    const sifre = document.getElementById('sifre').value;

    if (kullaniciAdi.length < 4) {
      alert("Kullanıcı adı en az 4 karakter olmalıdır.");
      return;
    }

    if (sifre.length < 6 || sifre.length > 15) {
      alert("Şifre 6 ile 15 karakter arasında olmalıdır.");
      return;
    }

    if (!/[A-Z]/.test(sifre)) {
      alert("Şifre en az bir büyük harf içermelidir.");
      return;
    }

    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(sifre)) {
      alert("Şifre en az bir özel karakter içermelidir.");
      return;
    }

    // Başarılı giriş
    alert("Giriş başarılı\nKullanıcı Adı: " + kullaniciAdi);
    localStorage.setItem('loggedInUser', kullaniciAdi);
    window.location.href = 'index.html';
  });
}

// ✅ Ürün kategorilerini yükle
function loadCategories() {
  fetch('https://fakestoreapi.com/products/categories')
    .then(res => res.json())
    .then(cats => {
      const select = document.getElementById('categorySelect');
      if (!select) return;
      cats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
      });
      select.onchange = applyFilters;
    });
}

// ✅ Ürünleri yükle
let products = [];
let filteredProducts = [];

function loadProducts() {
  fetch('https://fakestoreapi.com/products')
    .then(res => res.json())
    .then(data => {
      products = data;
      filteredProducts = data;
      renderProducts(data);
    });
}

// ✅ Olayları dinle
function setupEventListeners() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  const categorySelect = document.getElementById('categorySelect');
  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }
}

// ✅ Filtre uygula (arama, kategori ve sıralama)
function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedCategory = document.getElementById('categorySelect').value;
  const sortType = document.getElementById('sortSelect').value;

  filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(searchTerm);
    return matchCategory && matchSearch;
  });

  // Sıralama işlemi
  switch (sortType) {
    case 'priceAsc':
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case 'mostFavorited':
      const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      // Favorilerdeki ürünlerin ID ve sayısını tut
      const favCounts = {};
      favorites.forEach(fav => {
        favCounts[fav.id] = (favCounts[fav.id] || 0) + 1;
      });
      // Favori sayısına göre azalan sırala (favorisi olmayanlar 0 sayılır)
      filteredProducts.sort((a, b) => (favCounts[b.id] || 0) - (favCounts[a.id] || 0));
      break;
    case 'newest':
      // API'den gelen ürünlerin "id"leri artan sırada, büyük id = yeni ürün
      filteredProducts.sort((a, b) => b.id - a.id);
      break;
    default:
      // Varsayılan sıralama: id artan sırada
      filteredProducts.sort((a, b) => a.id - b.id);
      break;
  }

  renderProducts(filteredProducts);
}

// ✅ Ürünleri listele
function renderProducts(productsToRender) {
  const productList = document.getElementById('productList');
  if (!productList) return;

  productList.innerHTML = '';
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  productsToRender.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';

    const card = document.createElement('div');
    card.className = 'card h-100 product-card';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.title;
    img.style.cursor = 'pointer';
    img.style.height = '300px';
    img.style.objectFit = 'contain';
    img.className = 'card-img-top p-3';
    img.onclick = () => window.open(`product.html?id=${product.id}`, '_blank');

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body d-flex flex-column';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.textContent = product.title;

    const price = document.createElement('p');
    price.className = 'card-text fw-bold mt-auto';
    price.textContent = `$${product.price}`;

    let inCart = cart.find(p => p.id === product.id);
    let quantity = inCart ? inCart.quantity : 0;

    const cartControlDiv = document.createElement('div');
    cartControlDiv.className = 'mt-3';

    function updateCartButtons() {
      cartControlDiv.innerHTML = '';
      if (quantity === 0) {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-primary w-100';
        addBtn.textContent = 'Sepete Ekle';
        addBtn.onclick = () => {
          quantity = 1;
          addToCart(product, quantity);
          updateCartButtons();
        };
        cartControlDiv.appendChild(addBtn);
      } else {
        const minusBtn = document.createElement('button');
        minusBtn.className = 'btn btn-outline-secondary me-2';
        minusBtn.textContent = '-';
        minusBtn.onclick = () => {
          quantity--;
          if (quantity < 0) quantity = 0;
          addToCart(product, quantity);
          updateCartButtons();
        };

        const qtySpan = document.createElement('span');
        qtySpan.textContent = quantity;
        qtySpan.style.fontWeight = 'bold';
        qtySpan.style.fontSize = '1.2rem';

        const plusBtn = document.createElement('button');
        plusBtn.className = 'btn btn-outline-secondary ms-2';
        plusBtn.textContent = '+';
        plusBtn.onclick = () => {
          if (quantity < 5) {
            quantity++;
            addToCart(product, quantity);
            updateCartButtons();
          }
        };

        cartControlDiv.appendChild(minusBtn);
        cartControlDiv.appendChild(qtySpan);
        cartControlDiv.appendChild(plusBtn);
      }
    }

    updateCartButtons();

    const favs = JSON.parse(localStorage.getItem('favorites')) || [];
    const favBtn = document.createElement('button');
    favBtn.className = 'btn btn-warning mt-2';
    let isFav = favs.find(p => p.id === product.id);
    favBtn.textContent = isFav ? 'Favoride ⭐' : 'Favorilere Ekle';
    favBtn.onclick = () => {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      if (!favorites.find(p => p.id === product.id)) {
        favorites.push(product);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        favBtn.textContent = 'Favoride ⭐';
      }
    };

    cardBody.appendChild(title);
    cardBody.appendChild(price);
    cardBody.appendChild(cartControlDiv);
    cardBody.appendChild(favBtn);

    card.appendChild(img);
    card.appendChild(cardBody);
    col.appendChild(card);
    productList.appendChild(col);
  });
}

// ✅ Sepete ürün ekle
function addToCart(product, qty) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const index = cart.findIndex(p => p.id === product.id);
  if (qty === 0) {
    if (index !== -1) cart.splice(index, 1);
  } else if (index !== -1) {
    cart[index].quantity = qty;
  } else {
    cart.push({ ...product, quantity: qty });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
}
