document.addEventListener('DOMContentLoaded', () => {

    // Selectors for various parts of the checkout page
    const addressForm = document.querySelector('.address-form');
    const paymentStepContent = document.querySelector('.checkout-step:nth-child(3) .step-content');
    const addressStepContent = document.querySelector('.checkout-step:nth-child(1) .step-content');
    const paymentStepHeader = document.querySelector('.checkout-step:nth-child(3) .step-header');
    const addressStepHeader = document.querySelector('.checkout-step:nth-child(1)');
    const summaryContainer = document.querySelector('.order-summary-fixed');

    let customerInfo = null; // To store the address details after submission
    let cartItems = []; // To store the items for checkout

    /**
     * Fetches cart items from the backend to display in the summary.
     */
    async function fetchCartForCheckout() {
        try {
            const response = await fetch(`${window.__CONFIG__.API_BASE}/api/cart`, { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch cart.');
            
            cartItems = await response.json();

            // If cart is empty, redirect user away from checkout
            if (cartItems.length === 0) {
                alert("Your cart is empty. You cannot proceed to checkout.");
                window.location.href = 'index.html';
                return;
            }

            displayOrderSummary(cartItems);

        } catch (error) {
            console.error('Checkout error:', error);
            summaryContainer.innerHTML = '<p>Could not load order summary.</p>';
        }
    }

    /**
     * Displays the order summary on the right side of the page.
     * @param {Array} items - The array of items in the cart.
     */
    function displayOrderSummary(items) {
        const summaryItemsContainer = summaryContainer.querySelector('.summary-items');
        const priceDetailsContainer = summaryContainer.querySelector('.price-details');
        
        summaryItemsContainer.innerHTML = ''; // Clear previous items

        items.forEach(item => {
            summaryItemsContainer.innerHTML += `
                <div class="summary-item">
                    <img src="https://placehold.co/100x120/EFEFEF/AAAAAA&text=P1" alt="${item.name}">
                    <div class="item-info">
                        <p class="item-name">${item.name}</p>
                        <p class="item-qty">Qty: ${item.quantity}</p>
                    </div>
                    <p class="item-price">₹${item.price}</p>
                </div>
            `;
        });
        
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        priceDetailsContainer.innerHTML = `
            <div class="summary-line">
                <span>Bag Total</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
            <div class="summary-line">
                <span>Shipping Fee</span>
                <span class="free">FREE</span>
            </div>
            <div class="summary-total">
                <span>Total Amount</span>
                <span>₹${totalAmount.toFixed(2)}</span>
            </div>
        `;
    }

    /**
     * Handles the final order placement.
     */
    async function placeOrder() {
        if (!customerInfo) {
            alert('Please save your address before placing the order.');
            return;
        }

        // Basic validation for payment method
        const selectedPayment = document.querySelector('input[name="payment"]:checked');
        if (!selectedPayment) {
            alert('Please select a payment method.');
            return;
        }

        try {
            const response = await fetch(`${window.__CONFIG__.API_BASE}/api/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ customerInfo: customerInfo })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order.');
            }

            const result = await response.json();
            console.log('Order placed successfully:', result.order);

            // Store order details in sessionStorage to display on the confirmation page
            sessionStorage.setItem('orderDetails', JSON.stringify(result.order));

            // Redirect to the confirmation page
            window.location.href = 'confirmation.html';

        } catch (error) {
            console.error('Failed to place order:', error);
            alert(`Error: ${error.message}`);
        }
    }


    // --- EVENT LISTENERS ---

    // Handle Address Form Submission
    addressForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from actually submitting
        
        // Capture form data
        customerInfo = {
            name: document.getElementById('name').value,
            mobile: document.getElementById('mobile').value,
            pincode: document.getElementById('pincode').value,
            city: document.getElementById('city').value,
            address: document.getElementById('address').value,
        };

        // Basic validation
        if (!customerInfo.name || !customerInfo.address || !customerInfo.mobile) {
            alert('Please fill in all required address fields.');
            customerInfo = null; // Reset if invalid
            return;
        }

        // --- UX: Progress to the next step ---
        // Hide address form and show payment options
        addressStepContent.classList.add('hidden');
        addressStepHeader.classList.remove('active');
        
        paymentStepContent.classList.remove('hidden');
        paymentStepHeader.parentElement.classList.add('active');
        
        alert('Address saved! Please select your payment method.');
    });

    // Find the Place Order button and add a listener to it
    const placeOrderButton = document.querySelector('.place-order-btn');
    if(placeOrderButton) {
        placeOrderButton.addEventListener('click', placeOrder);
    }


    // --- INITIAL PAGE LOAD ---
    fetchCartForCheckout();
});