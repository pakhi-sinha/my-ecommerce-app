document.addEventListener('DOMContentLoaded', () => {

    const confirmationContainer = document.querySelector('.confirmation-container');

    function displayConfirmationDetails() {
        const orderDetailsString = sessionStorage.getItem('orderDetails');

        if (!orderDetailsString) {
            confirmationContainer.innerHTML = `
                <h1>No Order Details Found</h1>
                <p>You can view your orders in your account profile.</p>
                <div class="confirmation-actions">
                    <a href="index.html" class="continue-shopping-btn">CONTINUE SHOPPING</a>
                </div>
            `;
            return;
        }

        try {
            const order = JSON.parse(orderDetailsString);

            document.querySelector('.order-number').textContent = `Order ID: ${order.orderId}`;
            
            const shippingAddressContainer = document.querySelector('.shipping-address');
            shippingAddressContainer.innerHTML = `
                <h3>Delivering to:</h3>
                <p><strong>${order.customerInfo.name}</strong></p>
                <p>${order.customerInfo.address}, ${order.customerInfo.city}, ${order.customerInfo.pincode}</p>
            `;

            // **** THIS IS THE CORRECTED LOGIC ****
            // Target the new, specific container for items
            const summaryItemsContainer = document.getElementById('summary-items-list');
            summaryItemsContainer.innerHTML = ''; // Clear only the item list
            
            order.items.forEach(item => {
                summaryItemsContainer.innerHTML += `
                    <div class="summary-item">
                        <img src="https://placehold.co/100x120/EFEFEF/AAAAAA&text=Item" alt="${item.name}">
                        <div class="item-info">
                            <p class="item-brand">Brand Name</p>
                            <p class="item-name">${item.name}</p>
                            <p class="item-qty">Qty: ${item.quantity}</p>
                        </div>
                        <p class="item-price">₹${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                `;
            });

            // This selector will now work because it was never deleted
            const totalContainer = document.querySelector('.summary-total');
            totalContainer.innerHTML = `
                <span>Total Paid:</span>
                <span>₹${order.totalAmount.toFixed(2)}</span>
            `;

        } catch (error) {
            console.error('Failed to parse or display order details:', error);
            confirmationContainer.innerHTML = '<h1>Error</h1><p>Could not display your order confirmation. Please check your account for order details.</p>';
        } finally {
            sessionStorage.removeItem('orderDetails');
        }
    }

    displayConfirmationDetails();
});