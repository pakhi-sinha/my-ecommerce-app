document.addEventListener('DOMContentLoaded', () => {

    const productGrid = document.querySelector('.product-grid');
    const filterInputs = document.querySelectorAll('.filters input');
    
    let allProducts = [];

    // --- FETCH PRODUCTS (This part is updated) ---
    async function fetchProducts() {
        try {
            // UPDATED LINE: Using a simple relative path for the API call
            const response = await fetch('/api/products', { credentials: 'include' });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allProducts = await response.json();
            displayProducts(allProducts);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            productGrid.innerHTML = '<p>Sorry, we could not load the products. Please try again later.</p>';
        }
    }

    // --- DISPLAY PRODUCTS (No change here) ---
    function displayProducts(products) {
        // This function code is the same as before
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }
        products.forEach(product => {
            const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
            const ratingCountFormatted = product.ratingCount >= 1000 ? (product.ratingCount / 1000).toFixed(1) + 'k' : product.ratingCount;
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <span class="wishlist-icon" data-product-id="${product.id}"><i class="far fa-heart"></i></span>
                </div>
                <div class="product-info">
                    <h3 class="product-brand">${product.brand}</h3>
                    <h4 class="product-name">${product.name}</h4>
                    <div class="product-price">
                        <span class="current-price">₹${product.price}</span>
                        <span class="original-price">₹${product.originalPrice}</span>
                        <span class="discount">(${discount}% OFF)</span>
                    </div>
                    <div class="product-rating">
                        <i class="fa fa-star"></i> ${product.rating} | ${ratingCountFormatted}
                    </div>
                </div>
                <button class="add-to-cart-btn" data-product-id="${product.id}">ADD TO CART</button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    // --- APPLY FILTERS (No change here) ---
    function applyFilters() {
        // This function code is the same as before
        let filteredProducts = [...allProducts];
        const activeFilters = { categories: [], brands: [], price: null };
        document.querySelectorAll('.filters input:checked').forEach(input => {
            if (input.type === 'checkbox') {
                const group = input.closest('.filter-group').querySelector('h4').innerText.toUpperCase();
                if (group === 'CATEGORIES') activeFilters.categories.push(input.nextElementSibling.innerText);
                else if (group === 'BRAND') activeFilters.brands.push(input.nextElementSibling.innerText);
            } else if (input.type === 'radio') activeFilters.price = input.id;
        });
        if (activeFilters.categories.length > 0) filteredProducts = filteredProducts.filter(p => activeFilters.categories.includes(p.category));
        if (activeFilters.brands.length > 0) filteredProducts = filteredProducts.filter(p => activeFilters.brands.includes(p.brand));
        if (activeFilters.price) {
            if (activeFilters.price === 'price1') filteredProducts = filteredProducts.filter(p => p.price < 500);
            else if (activeFilters.price === 'price2') filteredProducts = filteredProducts.filter(p => p.price >= 500 && p.price <= 1000);
        }
        displayProducts(filteredProducts);
    }
    
    // --- ADD TO CART FUNCTION (This part is updated) ---
    /**
     * Sends a request to the backend to add a product to the cart.
     * @param {number} productId - The ID of the product to add.
     */
    async function addToCart(productId) {
        try {
            // UPDATED LINE: Using a simple relative path for the API call
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: parseInt(productId), // Ensure the ID is a number
                    quantity: 1 // Add one item at a time
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedCart = await response.json();
            console.log('Cart updated:', updatedCart);
            alert('Product successfully added to your bag!');

        } catch (error) {
            console.error('Failed to add item to cart:', error);
            alert('Something went wrong. Could not add item to bag.');
        }
    }


    // --- EVENT LISTENERS (No change here) ---
    filterInputs.forEach(input => {
        input.addEventListener('change', applyFilters);
    });

    productGrid.addEventListener('click', (e) => {
        const target = e.target;
        
        if (target.closest('.wishlist-icon')) {
            // Wishlist logic remains the same for now
            const icon = target.closest('.wishlist-icon').querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
            icon.style.color = icon.classList.contains('fas') ? 'red' : '';
        }

        if (target.classList.contains('add-to-cart-btn')) {
            const productId = target.dataset.productId;
            addToCart(productId);
        }
    });

    // --- INITIAL PAGE LOAD ---
    fetchProducts();
});