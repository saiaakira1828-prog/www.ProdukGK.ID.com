// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const mobileMenu = document.getElementById('mobileMenu');
const navLinks = document.getElementById('navLinks');
const form = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  themeToggle.textContent = mode === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('theme', mode);
  document.body.style.transition = 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1), color 0.6s ease';
}

// Load theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

// Theme toggle event with animation
themeToggle.addEventListener('click', () => {
  themeToggle.style.transform = 'rotateY(360deg)';
  setTimeout(() => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    themeToggle.style.transform = 'rotateY(0deg)';
  }, 300);
});

themeToggle.style.transition = 'transform 0.6s ease';

// ===== MOBILE MENU ANIMATION =====
mobileMenu.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  mobileMenu.style.transform = navLinks.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0)';
  mobileMenu.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    mobileMenu.style.transform = 'rotate(0)';
  });
});

// ===== FORM SUBMISSION WITH ANIMATIONS =====
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const name = form.name.value.trim();
    const originalHTML = submitBtn.innerHTML;
    
    try {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.7';
      submitBtn.style.transform = 'scale(0.95)';
      formMessage.textContent = '⏳ Mengirim pesan...';
      formMessage.className = 'form-message';
      
      // Kirim ke backend Flask API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
        },
        body: JSON.stringify({
          name: form.name.value.trim(),
          email: form.email.value.trim(),
          message: form.message.value.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        formMessage.textContent = `✅ ${data.message}`;
        formMessage.className = 'form-message success';
        form.reset();
        submitBtn.innerHTML = '<span class="btn-text"><span class="btn-text-main">✓ Terkirim</span></span>';
        
        setTimeout(() => {
          submitBtn.innerHTML = originalHTML;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
          submitBtn.style.transform = 'scale(1)';
          formMessage.textContent = '';
        }, 4000);
      } else {
        throw new Error(data.message || 'Gagal mengirim pesan');
      }
    } catch (error) {
      formMessage.textContent = '❌ Error: ' + error.message + '. Silakan coba lagi.';
      formMessage.className = 'form-message error';
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.transform = 'scale(1)';
    }
  });
}

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll('.section, .card, .project-card, .about-card, .float-card, .form-group, .contact-info');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealElements.forEach(el => {
  if (!el.classList.contains('float-card') && !el.classList.contains('form-group')) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  }
  observer.observe(el);
});

// ===== COUNTER ANIMATION =====
const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && !entry.target.dataset.counted) {
      const target = parseInt(entry.target.dataset.count);
      let current = 0;
      const increment = Math.max(1, Math.floor(target / 40));
      
      entry.target.dataset.counted = 'true';
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          entry.target.textContent = target;
          clearInterval(timer);
        } else {
          entry.target.textContent = current;
        }
      }, 30);
    }
  });
}, { threshold: 0.5 });

counters.forEach(counter => {
  counterObserver.observe(counter);
});

// ===== SMOOTH SCROLL & ACTIVE NAV LINK =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Highlight active nav link on scroll
window.addEventListener('scroll', () => {
  let fromTop = window.scrollY + 100;

  document.querySelectorAll('nav a[href^="#"]').forEach(link => {
    let section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    
    if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '700';
    } else {
      link.style.color = 'var(--text)';
      link.style.fontWeight = '500';
    }
  });
});

// ===== PARALLAX EFFECT ON SCROLL =====
let ticks = 0;
window.addEventListener('scroll', () => {
  ticks++;
  if (ticks % 3 !== 0) return;
  
  const scrolled = window.scrollY;
  const hero = document.querySelector('.hero');
  
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// ===== BUTTON RIPPLE EFFECT =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// ===== CARD HOVER ANIMATIONS =====
const cards = document.querySelectorAll('.card, .project-card, .about-card, .float-card');
cards.forEach((card, index) => {
  card.addEventListener('mouseenter', () => {
    card.style.animation = `none`;
    card.offsetHeight;
    card.style.animation = `fadeInUp 0.6s ease forwards`;
  });
});

// ===== SCROLL PROGRESS BAR =====
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), #7c3aed);
  z-index: 1000;
  transition: width 0.2s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrolled = (window.scrollY / scrollHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

// ===== TEXT ANIMATION ON LOAD =====
const animateWords = document.querySelectorAll('.animate-word');
animateWords.forEach((word, index) => {
  setTimeout(() => {
    word.style.opacity = '1';
  }, (index + 1) * 100);
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + D = Toggle Dark Mode
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    themeToggle.click();
  }
  
  // Escape = Close mobile menu
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    mobileMenu.style.transform = 'rotate(0)';
  }
  
  // ArrowDown = Scroll down
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    window.scrollBy({ top: 100, behavior: 'smooth' });
  }
  
  // ArrowUp = Scroll up
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    window.scrollBy({ top: -100, behavior: 'smooth' });
  }
});

// ===== STARS GENERATION (OPTIONAL) =====
function createStars() {
  const starsContainer = document.querySelector('.stars');
  if (starsContainer) {
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.style.cssText = `
        position: absolute;
        width: 2px;
        height:2px;
        background: white;
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.7 + 0.3};
        animation: starTwinkle ${Math.random() * 3 + 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
      `;
      starsContainer.appendChild(star);
    }
  }
}

createStars();

// ===== PAGE LOAD ANIMATION =====
window.addEventListener('load', () => {
  document.body.style.opacity = '1';
  document.body.style.animation = 'fadeIn 0.8s ease';
});

// ===== SKIP LINK (ACCESSIBILITY) =====
const skipLink = document.createElement('a');
skipLink.href = '#home';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
skipLink.style.cssText = `
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary);
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  z-index: 100;
  border-radius: 0 0 4px 0;
  font-weight: 600;
  font-size: 0.9rem;
  transition: top 0.3s ease;
`;

skipLink.addEventListener('focus', () => {
  skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
  skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ===== PRODUCT MANAGEMENT =====
const productBtns = document.querySelectorAll('.product-btn');

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  badge.textContent = cart.length;
  badge.style.display = cart.length > 0 ? 'flex' : 'none';
}

// Add to cart
productBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const productId = btn.getAttribute('data-product-id');
    const productName = btn.getAttribute('data-product-name');
    const productPrice = parseInt(btn.getAttribute('data-product-price'));
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (!existingItem) {
      cart.push({ id: productId, name: productName, price: productPrice });
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartBadge();
      showNotification(`${productName} ditambahkan ke keranjang!`, 'success');
    } else {
      showNotification(`${productName} sudah ada di keranjang!`, 'info');
    }
  });
});

// Modal Management
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const checkoutModal = document.getElementById('checkoutModal');
const closeCartBtn = document.getElementById('closeCart');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const checkoutBtn = document.getElementById('checkoutBtn');
const backToPaymentBtn = document.getElementById('backToPaymentBtn');

function displayCart() {
  const cartItems = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; color: #999;">Keranjang Anda kosong</p>';
  } else {
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Hapus</button>
      </div>
    `).join('');
  }
  
  updateCartTotal();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  displayCart();
}

function updateCartTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal;
  
  document.getElementById('subtotal').textContent = 'Rp ' + subtotal.toLocaleString('id-ID');
  document.getElementById('total').textContent = 'Rp ' + total.toLocaleString('id-ID');
  
  // Disable checkout if cart is empty
  checkoutBtn.disabled = cart.length === 0;
  checkoutBtn.style.opacity = cart.length === 0 ? '0.5' : '1';
  checkoutBtn.style.cursor = cart.length === 0 ? 'not-allowed' : 'pointer';
}

// Cart modal events
cartBtn.addEventListener('click', () => {
  displayCart();
  cartModal.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
  cartModal.classList.remove('active');
});

checkoutBtn.addEventListener('click', () => {
  if (cart.length > 0) {
    // Display order summary
    const orderItems = document.getElementById('orderItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    
    orderItems.innerHTML = cart.map((item, index) => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; ${index !== cart.length - 1 ? 'border-bottom: 1px solid rgba(37, 99, 235, 0.1);' : ''}">
        <div>
          <div style="font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">${item.name}</div>
          <div style="font-size: 0.9rem; color: var(--text-secondary);">Qty: 1</div>
        </div>
        <div style="font-weight: 700; color: var(--primary); text-align: right;">Rp ${item.price.toLocaleString('id-ID')}</div>
      </div>
    `).join('');
    
    checkoutTotal.textContent = 'Rp ' + total.toLocaleString('id-ID');
    
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
  }
});

// Checkout modal events
closeCheckoutBtn.addEventListener('click', () => {
  checkoutModal.classList.remove('active');
  document.getElementById('paymentDetails').style.display = 'none';
});

// Payment method selection
const paymentOptions = document.querySelectorAll('.payment-option');
let selectedPaymentMethod = null;

paymentOptions.forEach(option => {
  option.addEventListener('click', () => {
    paymentOptions.forEach(opt => opt.classList.remove('active'));
    option.classList.add('active');
    selectedPaymentMethod = option.getAttribute('data-method');
    showPaymentDetails(selectedPaymentMethod);
  });
});

function showPaymentDetails(method) {
  const paymentDetails = document.getElementById('paymentDetails');
  const paymentInfo = document.getElementById('paymentInfo');
  const paymentInstruction = document.getElementById('paymentInstruction');
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  
  let details = '';
  
  switch(method) {
    case 'qris':
      details = `
        <p><strong>Pilihan: QRIS</strong></p>
        <p>Total Pembayaran: <strong style="color: var(--primary); font-size: 1.3rem;">Rp ${total.toLocaleString('id-ID')}</strong></p>
      `;
      paymentInstruction.innerHTML = `
        <ol>
          <li>Buka aplikasi pembayaran Anda (e-wallet, mobile banking)</li>
          <li>Pilih menu scan QR Code</li>
          <li>Arahkan kamera ke QR Code yang ditampilkan</li>
          <li>Konfirmasi pembayaran sebesar Rp ${total.toLocaleString('id-ID')}</li>
          <li>Tunggu konfirmasi transaksi</li>
        </ol>
      `;
      break;
      
    case 'dana':
      details = `
        <p><strong>Pilihan: Dana</strong></p>
        <p>Total Pembayaran: <strong style="color: var(--primary); font-size: 1.3rem;">Rp ${total.toLocaleString('id-ID')}</strong></p>
        <p>Nomor Dana: <strong>085177441368</strong> (Atas Nama: Syaifi alli)</p>
      `;
      paymentInstruction.innerHTML = `
        <ol>
          <li>Buka aplikasi Dana</li>
          <li>Pilih menu Transfer atau Kirim Uang</li>
          <li>Masukkan nomor Dana: 085177441368</li>
          <li>Masukkan jumlah: Rp ${total.toLocaleString('id-ID')}</li>
          <li>Tambahkan catatan: "Pembelian Produk Digital"</li>
          <li>Konfirmasi dan kirim</li>
        </ol>
      `;
      break;
      
    case 'gopay':
      details = `
        <p><strong>Pilihan: GoPay</strong></p>
        <p>Total Pembayaran: <strong style="color: var(--primary); font-size: 1.3rem;">Rp ${total.toLocaleString('id-ID')}</strong></p>
        <p>Nomor GoPay: <strong>085711970434</strong> (Atas Nama: Syaifi alli)</p>
      `;
      paymentInstruction.innerHTML = `
        <ol>
          <li>Buka aplikasi GoPay</li>
          <li>Pilih menu Kirim Uang</li>
          <li>Cari kontak atau masukkan nomor: 085711970434</li>
          <li>Masukkan jumlah: Rp ${total.toLocaleString('id-ID')}</li>
          <li>Tambahkan pesan: "Pembelian Produk Digital"</li>
          <li>Konfirmasi pembayaran</li>
        </ol>
      `;
      break;
  }
  
  paymentInfo.innerHTML = details;
  paymentDetails.style.display = 'block';
}

backToPaymentBtn.addEventListener('click', () => {
  paymentOptions.forEach(opt => opt.classList.remove('active'));
  document.getElementById('paymentDetails').style.display = 'none';
  selectedPaymentMethod = null;
});

// Confirm Payment
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
confirmPaymentBtn.addEventListener('click', () => {
  if (!selectedPaymentMethod) {
    showNotification('Pilih metode pembayaran terlebih dahulu', 'error');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const orderData = {
    id: 'ORD-' + Date.now(),
    items: cart,
    total: total,
    paymentMethod: selectedPaymentMethod,
    timestamp: new Date().toLocaleString('id-ID')
  };
  
  // Save order
  let orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(orderData);
  localStorage.setItem('orders', JSON.stringify(orders));
  
  // Clear cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Close modals
  checkoutModal.classList.remove('active');
  
  // Show confirmation
  showNotification(`Pembayaran dikonfirmasi! Terima kasih atas pembelian Anda. Order ID: ${orderData.id}`, 'success');
  
  // Update badge
  updateCartBadge();
  
  // Send email notification to backend API
  // TODO: Implement email service integration
});

// Initialize
updateCartBadge();

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: ${type === 'success' ? 'var(--accent)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
    color: white;
    padding: 1.2rem 1.8rem;
    border-radius: 0.8rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 2000;
    animation: slideInUp 0.4s ease;
    font-weight: 500;
    max-width: 400px;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideUp 0.4s ease';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ===== ENHANCED ANIMATIONS =====
// Add stagger effect to cards on page load
const customCards = document.querySelectorAll('.card, .product-card, .about-card');
customCards.forEach((card, index) => {
  card.style.setProperty('--delay', (index * 0.1) + 's');
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.03)';
  });
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
});

// Smooth reveal on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeInUp 0.8s ease both';
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
  revealObserver.observe(section);
});

// ===== MOUSE FOLLOW EFFECT (SUBTLE) =====
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  // Optional: Add subtle background effect
  const hero = document.querySelector('.hero');
  if (hero && window.scrollY < window.innerHeight) {
    const xPercent = (mouseX / window.innerWidth) * 2 - 1;
    const yPercent = (mouseY / window.innerHeight) * 2 - 1;
    hero.style.backgroundPosition = `${50 + xPercent * 5}% ${50 + yPercent * 5}%`;
  }
});

// ===== PRODUCT READY FOR PUBLICATION =====
// All features initialized and ready for production deployment