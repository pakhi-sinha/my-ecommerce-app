document.addEventListener('DOMContentLoaded', () => {

    // Selectors for the main parts of the cart page
    const cartItemsList = document.querySelector('.cart-items-list');
    const orderSummary = document.querySelector('.order-summary');

    /**
     * Fetches cart items from the backend and triggers the display.
     */
    async function fetchCartItems() {
        try {
            const response = await fetch(`${window.__CONFIG__.API_BASE}/api/cart`, { credentials: 'include' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const items = await response.json();
            displayCartItems(items);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            cartItemsList.innerHTML = '<p>Could not load your bag. Please try again.</p>';
        }
    }

    /**
     * Displays the cart items on the page and calculates the total.
     * @param {Array} items - The array of items in the cart.
     */
    function displayCartItems(items) {
        // Clear current content
        cartItemsList.innerHTML = '';
        
        if (items.length === 0) {
            cartItemsList.innerHTML = '<h2>Your shopping bag is empty.</h2><p>Add items to your bag to see them here.</p>';
            updateOrderSummary([]); // Update summary to show zeros
            return;
        }

        // Generate HTML for each item
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            // Note: We use data-attributes to store the product ID for easy access
            itemElement.dataset.productId = item.productId; 

            // For now, we'll use placeholder images and data for discount
            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="https://placehold.co/110x140/EFEFEF/AAAAAA&text=Item" alt="${item.name}">
                </div>
                <div class="item-details">
                    <p class="item-brand">Brand Name</p> <!-- Placeholder -->
                    <p class="item-name">${item.name}</p>
                    <div class="item-price">
                        <span class="current-price">₹${item.price}</span>
                    </div>
                    <div class="item-actions">
                        <div class="quantity-selector">
                            <button class="quantity-btn minus">-</button>
                            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <button class="remove-btn">REMOVE</button>
                    </div>
                </div>
            `;
            cartItemsList.appendChild(itemElement);
        });

        updateOrderSummary(items);
    }

    /**
     * Updates the price details in the order summary section.
     * @param {Array} items - The array of items in the cart.
     */
    function updateOrderSummary(items) {
        const bagTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 0; // Assuming free shipping for now
        const totalAmount = bagTotal + shippingFee;

        orderSummary.innerHTML = `
            <h4>ORDER DETAILS</h4>
            <div class="summary-line">
                <span>Bag Total</span>
                <span>₹${bagTotal.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping Fee</span>
                <span class="free">FREE</span>
            </div>
            <div class="summary-total">
                <span>Total Amount</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" ${items.length === 0 ? 'disabled' : ''}>PROCEED TO CHECKOUT</button>
        `;

        // Add event listener to the newly created checkout button
        const checkoutButton = orderSummary.querySelector('.checkout-btn');
        if (checkoutButton) {
            checkoutButton.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }
    }

    /**
     * Handles updating an item's quantity or removing it from the cart.
     * @param {number} productId - The ID of the product.
     * @param {number} newQuantity - The new quantity. If 0, the item is removed.
     */
    async function updateCart(productId, newQuantity) {
        let response;
        try {
            if (newQuantity > 0) {
                // Update quantity using PUT request
                response = await fetch(`${window.__CONFIG__.API_BASE}/api/cart/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ quantity: newQuantity })
                });
            } else {
                // Remove item using DELETE request
                response = await fetch(`${window.__CONFIG__.API_BASE}/api/cart/${productId}`, {
                    method: 'DELETE'
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedCart = await response.json();
            displayCartItems(updatedCart); // Re-render the cart with the new data

        } catch (error) {
            console.error('Failed to update cart:', error);
            alert('Could not update your bag. Please try again.');
        }
    }


    // --- EVENT LISTENER FOR THE ENTIRE CART LIST ---
    // Using event delegation to handle clicks on buttons for all items
    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const productId = cartItem.dataset.productId;
        const currentQuantity = parseInt(cartItem.querySelector('.quantity-input').value);

        if (target.classList.contains('plus')) {
            updateCart(productId, currentQuantity + 1);
        } else if (target.classList.contains('minus')) {
            updateCart(productId, currentQuantity - 1); // The backend will handle removal if quantity becomes 0
        } else if (target.classList.contains('remove-btn')) {
            updateCart(productId, 0); // Setting quantity to 0 to remove
        }
    });

    // --- INITIAL PAGE LOAD ---
    fetchCartItems();

});