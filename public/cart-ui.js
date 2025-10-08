document.addEventListener('DOMContentLoaded', () => {
    const cartItemsList = document.querySelector('.cart-items-list');
    const orderSummary = document.querySelector('.order-summary');

    // --- FETCH CART ITEMS ---
    async function fetchCartItems() {
        try {
            const response = await fetch('/api/cart', { credentials: 'include' });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const items = await response.json();
            displayCartItems(items);
        } catch (error) {
            console.error('Failed to fetch cart items:', error);
            cartItemsList.innerHTML = '<p>Could not load your bag. Please try again.</p>';
        }
    }

    // --- DISPLAY CART ITEMS ---
    function displayCartItems(items) {
        cartItemsList.innerHTML = '';
        if (items.length === 0) {
            cartItemsList.innerHTML = '<h2>Your shopping bag is empty.</h2>';
            updateOrderSummary([]);
            return;
        }

        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.dataset.productId = item.productId;

            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="https://placehold.co/110x140/EFEFEF/AAAAAA&text=Item" alt="${item.name}">
                </div>
                <div class="item-details">
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

    // --- UPDATE ORDER SUMMARY ---
    function updateOrderSummary(items) {
        const bagTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 0;
        const totalAmount = bagTotal + shippingFee;

        orderSummary.innerHTML = `
            <h4>ORDER DETAILS</h4>
            <div class="summary-line"><span>Bag Total</span><span>₹${bagTotal.toFixed(2)}</span></div>
            <div class="summary-line"><span>Shipping Fee</span><span class="free">FREE</span></div>
            <div class="summary-total"><span>Total Amount</span><span>₹${totalAmount.toFixed(2)}</span></div>
            <button class="checkout-btn" ${items.length === 0 ? 'disabled' : ''}>PROCEED TO CHECKOUT</button>
        `;
    }

    // --- UPDATE CART (PUT / DELETE) ---
    async function updateCart(productId, newQuantity) {
        try {
            let response;
            if (newQuantity > 0) {
                response = await fetch(`/api/cart/${productId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: newQuantity })
                });
            } else {
                response = await fetch(`/api/cart/${productId}`, { method: 'DELETE' });
            }

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const updatedCart = await response.json();
            displayCartItems(updatedCart);
        } catch (error) {
            console.error('Failed to update cart:', error);
            alert('Could not update your bag. Please try again.');
        }
    }

    // --- EVENT LISTENERS ---
    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        const cartItem = target.closest('.cart-item');
        if (!cartItem) return;

        const productId = cartItem.dataset.productId;
        const currentQuantity = parseInt(cartItem.querySelector('.quantity-input').value);

        if (target.classList.contains('plus')) {
            updateCart(productId, currentQuantity + 1);
        } else if (target.classList.contains('minus')) {
            updateCart(productId, currentQuantity - 1);
        } else if (target.classList.contains('remove-btn')) {
            updateCart(productId, 0);
        }
    });

    // --- INITIAL LOAD ---
    fetchCartItems();
});
