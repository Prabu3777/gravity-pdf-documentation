// Products Database
const allProducts = [
    {
        id: 'cardamom',
        name: 'Premium Cardamom',
        description: 'Green cardamom from Kerala farms',
        price: 1200,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        badge: 'Premium',
        featured: true
    },
    {
        id: 'black-pepper',
        name: 'Black Pepper',
        description: 'Malabar black pepper, bold flavor',
        price: 650,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        badge: 'Best Seller',
        featured: true
    },
    {
        id: 'cloves',
        name: 'Cloves',
        description: 'Aromatic whole cloves',
        price: 800,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1585671215623-2b2a7f566e3f?w=500',
        featured: true
    },
    {
        id: 'fennel',
        name: 'Fennel Seeds',
        description: 'Premium quality fennel',
        price: 280,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        featured: true
    },
    {
        id: 'cumin',
        name: 'Cumin Seeds',
        description: 'Rajasthan cumin, rich aroma',
        price: 320,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        featured: true
    },
    {
        id: 'mustard',
        name: 'Mustard Seeds',
        description: 'Black & yellow varieties',
        price: 180,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1585671215623-2b2a7f566e3f?w=500',
        featured: false
    },
    {
        id: 'fenugreek',
        name: 'Fenugreek',
        description: 'Golden fenugreek seeds',
        price: 150,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        featured: false
    },
    {
        id: 'coriander',
        name: 'Coriander Seeds',
        description: 'Fresh harvest coriander',
        price: 220,
        category: 'whole',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        badge: 'New',
        featured: false
    },
    {
        id: 'turmeric',
        name: 'Turmeric Powder',
        description: 'Pure turmeric powder',
        price: 280,
        category: 'ground',
        image: 'https://images.unsplash.com/photo-1585671215623-2b2a7f566e3f?w=500',
        featured: false
    },
    {
        id: 'chilli-powder',
        name: 'Red Chilli Powder',
        description: 'Spicy red chilli powder',
        price: 350,
        category: 'ground',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        featured: false
    },
    {
        id: 'coriander-powder',
        name: 'Coriander Powder',
        description: 'Ground coriander powder',
        price: 200,
        category: 'ground',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        featured: false
    },
    {
        id: 'garam-masala',
        name: 'Garam Masala',
        description: 'Traditional spice blend',
        price: 420,
        category: 'ground',
        image: 'https://images.unsplash.com/photo-1585671215623-2b2a7f566e3f?w=500',
        badge: 'Popular',
        featured: false
    },
    {
        id: 'cardamom-export',
        name: 'Export Grade Cardamom',
        description: 'Premium export quality',
        price: 1500,
        category: 'export',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        badge: 'Export Quality',
        featured: false
    },
    {
        id: 'pepper-export',
        name: 'Export Grade Black Pepper',
        description: 'International quality standards',
        price: 850,
        category: 'export',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        badge: 'Export Quality',
        featured: false
    },
    {
        id: 'bulk-cardamom',
        name: 'Bulk Cardamom (25kg)',
        description: 'Wholesale pack - 25kg',
        price: 28000,
        category: 'bulk',
        image: 'https://images.unsplash.com/photo-1596040033229-a0b8d1cf0877?w=500',
        badge: 'Wholesale',
        featured: false
    },
    {
        id: 'bulk-pepper',
        name: 'Bulk Black Pepper (25kg)',
        description: 'Wholesale pack - 25kg',
        price: 15000,
        category: 'bulk',
        image: 'https://images.unsplash.com/photo-1599909533780-d8c3e4c2a7a6?w=500',
        badge: 'Wholesale',
        featured: false
    }
];

// State
let filteredProducts = [...allProducts];
let currentCategory = 'all';
let currentSort = 'featured';
let currentSearchQuery = '';

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const productsCount = document.getElementById('productsCount');
const noProducts = document.getElementById('noProducts');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const productSearch = document.getElementById('productSearch');

// Initialize
function init() {
    renderProducts();
    attachEventListeners();

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('category')) {
        const category = urlParams.get('category');
        categoryFilter.value = category;
        currentCategory = category;
        filterProducts();
    }
}

// Render Products
function renderProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        productsCount.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }

    productsGrid.style.display = 'grid';
    productsCount.style.display = 'block';
    noProducts.style.display = 'none';

    productsCount.textContent = `Showing ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-product="${product.id}">
            <div class="product-image">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="btn-icon quick-view" data-product="${product.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon add-to-cart" data-product="${product.id}">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toLocaleString()}${product.category === 'bulk' ? '' : '/kg'}</span>
                    <a href="product-detail.html?product=${product.id}" class="btn-text">View Details</a>
                </div>
            </div>
        </div>
    `).join('');

    // Animate products
    const cards = productsGrid.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Filter Products
function filterProducts() {
    filteredProducts = allProducts.filter(product => {
        // Category filter
        const categoryMatch = currentCategory === 'all' || product.category === currentCategory;

        // Search filter
        const searchMatch = currentSearchQuery === '' ||
            product.name.toLowerCase().includes(currentSearchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(currentSearchQuery.toLowerCase());

        return categoryMatch && searchMatch;
    });

    sortProducts();
    renderProducts();
}

// Sort Products
function sortProducts() {
    switch (currentSort) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'featured':
        default:
            filteredProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return 0;
            });
            break;
    }
}

// Event Listeners
function attachEventListeners() {
    // Category Filter
    categoryFilter.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        filterProducts();
    });

    // Sort Filter
    sortFilter.addEventListener('change', (e) => {
        currentSort = e.target.value;
        sortProducts();
        renderProducts();
    });

    // Search Filter
    let searchTimeout;
    productSearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearchQuery = e.target.value.trim();
            filterProducts();
        }, 300);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
