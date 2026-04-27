const cartButton = document.getElementById('cartButton');
const cartClose = document.getElementById('cartClose');
const cartDropdown = document.getElementById('cartDropdown');
const cartCount = document.getElementById('cartCount');
const cartItemsList = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');

const CART_KEY = 'molinosCarrito';
const WHATSAPP_NUMBER = '+5492975177791'; // aca pongo el numero de whatsapp de la persona a la que le va a llegar el mensaje

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

//funcion para actualizar la UI del carrito cada vez que se modifica el carrito 

function updateCartUI() {
  const cart = loadCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = itemCount;

  cartItemsList.innerHTML = '';
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<li class="cart-item"><span class="cart-item-name">El carrito está vacío.</span></li>';
    cartTotal.textContent = 'Total: $0,00';
    return;
  }

  cart.forEach(item => {
    const itemElement = document.createElement('li');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-controls">
        <button class="qty-btn decrease-qty" data-name="${item.name}" type="button">−</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="qty-btn increase-qty" data-name="${item.name}" type="button">+</button>
      </div>
    `;
    cartItemsList.appendChild(itemElement);
  });

  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = `Total: ${formatPrice(totalValue)}`;
}

function addToCart(name, price) {
  const cart = loadCart();
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price, quantity: 1 });
  }
  saveCart(cart);
  updateCartUI();
}

function removeFromCart(name) {
  const cart = loadCart();
  const updatedCart = cart.filter(item => item.name !== name);
  saveCart(updatedCart);
  updateCartUI();
}

function updateQuantity(name, newQuantity) {
  const cart = loadCart();
  if (newQuantity <= 0) {
    removeFromCart(name);
    return;
  }
  const item = cart.find(item => item.name === name);
  if (item) {
    item.quantity = newQuantity;
    saveCart(cart);
    updateCartUI();
  }
}

// funcion para mandar el mensaje al wspp detallando que quiero comprar
function getWhatsAppText(cart) {
  const lines = ['Hola, quiero comprar:'];
  cart.forEach(item => {
    const priceText = formatPrice(item.price);
    lines.push(`- ${item.name} x${item.quantity} (${priceText} c/u)`);
  });
  const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  lines.push(`Total: ${formatPrice(totalValue)}`);
  lines.push('Por favor confirmame la disponibilidad y el envío.');
  return encodeURIComponent(lines.join('\n'));
}

function sendCartToWhatsApp() {
  const cart = loadCart();
  if (cart.length === 0) {
    alert('El carrito está vacío. Agregá al menos un producto antes de ir al pago.');
    return;
  }

  const text = getWhatsAppText(cart);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, '_blank');
}

function toggleCartDropdown() {
  const isOpen = cartDropdown.classList.toggle('open');
  cartDropdown.setAttribute('aria-hidden', String(!isOpen));
}

cartButton.addEventListener('click', toggleCartDropdown);
cartClose.addEventListener('click', toggleCartDropdown);

window.addEventListener('click', (event) => {
  if (!cartDropdown.contains(event.target) && !cartButton.contains(event.target)) {
    cartDropdown.classList.remove('open');
    cartDropdown.setAttribute('aria-hidden', 'true');
  }
});

document.querySelectorAll('.boton-catalogo').forEach(button => {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const name = button.dataset.name || 'Producto';
    const price = Number(button.dataset.price) || 0;
    addToCart(name, price);
    cartDropdown.classList.add('open');
    cartDropdown.setAttribute('aria-hidden', 'false');
  });
});

checkoutBtn.addEventListener('click', (event) => {
  event.preventDefault();
  sendCartToWhatsApp();
});

cartItemsList.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('decrease-qty') || target.classList.contains('increase-qty')) {
    event.stopPropagation();
    const name = target.dataset.name;
    const cart = loadCart();
    const item = cart.find(item => item.name === name);
    if (!item) return;

    const delta = target.classList.contains('increase-qty') ? 1 : -1;
    updateQuantity(name, item.quantity + delta);
  }
});

updateCartUI();
