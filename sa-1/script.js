// ===========================
// Global Variables
// ===========================

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// ===========================
// Navigation & Header
// ===========================

const header = document.getElementById('header');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

// Sticky Header on Scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu Toggle
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
        });
    });
}

// Active Nav Link Based on Scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLink.classList.add('active');
            } else {
                navLink.classList.remove('active');
            }
        }
    });
});

// ===========================
// Search Functionality
// ===========================

const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

const products = [
    { name: 'Premium Cardamom', category: 'Whole Spices', price: 1200, link: 'product-detail.html?product=cardamom' },
    { name: 'Black Pepper', category: 'Whole Spices', price: 650, link: 'product-detail.html?product=black-pepper' },
    { name: 'Cloves', category: 'Whole Spices', price: 800, link: 'product-detail.html?product=cloves' },
    { name: 'Fennel Seeds', category: 'Whole Spices', price: 280, link: 'product-detail.html?product=fennel' },
    { name: 'Cumin Seeds', category: 'Whole Spices', price: 320, link: 'product-detail.html?product=cumin' },
    { name: 'Mustard Seeds', category: 'Whole Spices', price: 180, link: 'product-detail.html?product=mustard' },
    { name: 'Fenugreek', category: 'Whole Spices', price: 150, link: 'product-detail.html?product=fenugreek' },
    { name: 'Coriander Seeds', category: 'Whole Spices', price: 220, link: 'product-detail.html?product=coriander' }
];

if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        searchOverlay.classList.add('active');
        setTimeout(() => searchInput.focus(), 300);
    });
}

if (searchClose) {
    searchClose.addEventListener('click', () => {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    });
}

if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const results = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query)
        );

        displaySearchResults(results);
    });
}

function displaySearchResults(results) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">No products found</div>';
        return;
    }

    const resultsHTML = results.map(product => `
        <a href="${product.link}" style="display: flex; padding: 15px; border-bottom: 1px solid #E5E5E5; align-items: center; gap: 15px; transition: background 0.3s;">
            <div style="flex: 1;">
                <div style="font-weight: 600; color: #1B3A2B; margin-bottom: 5px;">${product.name}</div>
                <div style="font-size: 13px; color: #999;">${product.category}</div>
            </div>
            <div style="font-weight: 700; color: #C46A2D;">₹${product.price}/kg</div>
        </a>
    `).join('');

    searchResults.innerHTML = resultsHTML;

    // Add hover effects
    const resultItems = searchResults.querySelectorAll('a');
    resultItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = '#F8F5F0';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'transparent';
        });
    });
}

// Close search on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
        searchInput.value = '';
        searchResults.innerHTML = '';
    }
});

// ===========================
// Cart Functionality
// ===========================

const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');

function updateCartUI() {
    // Update cart count
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Update cart items display
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            if (cartTotal) cartTotal.textContent = '₹0';
            return;
        }

        const itemsHTML = cart.map(item => `
            <div class="cart-item" style="display: flex; gap: 15px; padding: 15px 0; border-bottom: 1px solid #E5E5E5;">
                <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="font-size: 16px; margin-bottom: 5px;">${item.name}</h4>
                    <p style="color: #C46A2D; font-weight: 600;">₹${item.price}/kg</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                        <button onclick="updateCartQuantity('${item.id}', -1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">-</button>
                        <span style="font-weight: 600;">${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">+</button>
                        <button onclick="removeFromCart('${item.id}')" style="margin-left: auto; color: #C46A2D; background: transparent; border: none; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        cartItems.innerHTML = itemsHTML;

        // Update total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;
    }

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, name, price, image) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    updateCartUI();
    showNotification('Product added to cart!', 'success');
    openCart();
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    showNotification('Product removed from cart', 'info');
}

function openCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeCart() {
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

// Add to Cart buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart')) {
        const button = e.target.closest('.add-to-cart');
        const productCard = button.closest('.product-card');
        const productId = productCard.dataset.product || 'product-' + Date.now();
        const productName = productCard.querySelector('.product-name').textContent;
        const productPrice = parseInt(productCard.querySelector('.product-price').textContent.replace(/[^\d]/g, ''));
        const productImage = productCard.querySelector('.product-image img').src;

        addToCart(productId, productName, productPrice, productImage);
    }
});

// Initialize cart on page load
updateCartUI();

// ===========================
// Notification System
// ===========================

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations to the page
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===========================
// Newsletter Form
// ===========================

const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector('input[type="email"]').value;

        if (email) {
            // Simulate API call
            setTimeout(() => {
                showNotification('Successfully subscribed to newsletter!', 'success');
                newsletterForm.reset();
            }, 500);
        }
    });
}

// ===========================
// Quick View Modal
// ===========================

document.addEventListener('click', (e) => {
    if (e.target.closest('.quick-view')) {
        const button = e.target.closest('.quick-view');
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('.product-name').textContent;
        const productDesc = productCard.querySelector('.product-desc').textContent;
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-image img').src;

        showQuickView({
            name: productName,
            description: productDesc,
            price: productPrice,
            image: productImage
        });
    }
});

function showQuickView(product) {
    const modal = document.createElement('div');
    modal.className = 'quick-view-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="background: white; max-width: 800px; width: 90%; border-radius: 16px; overflow: hidden; animation: scaleIn 0.3s ease;">
            <button onclick="this.closest('.quick-view-modal').remove(); document.body.style.overflow = ''" style="position: absolute; top: 20px; right: 20px; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px; z-index: 10;">×</button>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0;">
                <div style="background: #F8F5F0;">
                    <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="padding: 40px;">
                    <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; margin-bottom: 15px; color: #1B3A2B;">${product.name}</h2>
                    <p style="color: #999; margin-bottom: 20px;">${product.description}</p>
                    <div style="font-size: 32px; font-weight: 700; color: #C46A2D; margin-bottom: 30px; font-family: 'Playfair Display', serif;">${product.price}</div>
                    <div style="display: flex; gap: 15px;">
                        <button onclick="addToCart('${product.name.replace(/\s+/g, '-').toLowerCase()}', '${product.name}', ${parseInt(product.price.replace(/[^\d]/g, ''))}, '${product.image}')" style="flex: 1; padding: 15px; background: #C46A2D; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Add to Cart</button>
                        <a href="product-detail.html?product=${product.name.replace(/\s+/g, '-').toLowerCase()}" style="flex: 1; padding: 15px; background: #1B3A2B; color: white; border: none; border-radius: 8px; font-weight: 600; text-align: center; display: flex; align-items: center; justify-content: center;">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Add animation styles
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes scaleIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(animationStyle);

// ===========================
// Testimonial Slider
// ===========================

const testimonialPrev = document.querySelector('.testimonial-prev');
const testimonialNext = document.querySelector('.testimonial-next');
let currentTestimonialIndex = 0;

if (testimonialPrev && testimonialNext) {
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    function updateTestimonialSlider() {
        testimonialCards.forEach((card, index) => {
            card.style.display = index === currentTestimonialIndex ? 'block' : 'none';
        });
    }

    testimonialPrev.addEventListener('click', () => {
        currentTestimonialIndex = currentTestimonialIndex === 0 ? testimonialCards.length - 1 : currentTestimonialIndex - 1;
        updateTestimonialSlider();
    });

    testimonialNext.addEventListener('click', () => {
        currentTestimonialIndex = currentTestimonialIndex === testimonialCards.length - 1 ? 0 : currentTestimonialIndex + 1;
        updateTestimonialSlider();
    });

    // Auto-play testimonials
    setInterval(() => {
        currentTestimonialIndex = currentTestimonialIndex === testimonialCards.length - 1 ? 0 : currentTestimonialIndex + 1;
        updateTestimonialSlider();
    }, 5000);
}

// ===========================
// Scroll Animations
// ===========================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeUp 0.8s forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements for scroll animation
document.querySelectorAll('.product-card, .feature-card, .category-card, .testimonial-card').forEach(el => {
    observer.observe(el);
});

// ===========================
// Smooth Scroll
// ===========================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#!') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===========================
// Page Load Animations
// ===========================

window.addEventListener('load', () => {
    // Trigger hero animations
    document.querySelectorAll('.animate-fade-up').forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 150);
    });
});

// ===========================
// Console Welcome Message
// ===========================

console.log('%cEllakai Spices', 'color: #C46A2D; font-size: 24px; font-weight: bold;');
console.log('%cPremium Quality Spices Direct From Farmers', 'color: #1B3A2B; font-size: 14px;');
console.log('%cWebsite developed for wholesale & retail spice suppliers', 'color: #999; font-size: 12px;');
