document.addEventListener('DOMContentLoaded', async () => {
    const cartSummary = document.getElementById('cart-summary');
    const placeOrderBtn = document.getElementById('place-order');
    const addressForm = document.getElementById('address-form');
    const paymentSelect = document.getElementById('payment-method');
  
    let customerInfo = {};
    const API_BASE = window.__CONFIG__.API_BASE;
  
    // Fetch cart items
    async function loadCart() {
      try {
        const response = await fetch(`${API_BASE}/api/cart`, { credentials: 'include' });
        const cart = await response.json();
        cartSummary.innerHTML = '';
        let total = 0;
  
        cart.forEach(item => {
          const itemEl = document.createElement('div');
          itemEl.textContent = `${item.name} x ${item.quantity} - ₹${item.price * item.quantity}`;
          cartSummary.appendChild(itemEl);
          total += item.price * item.quantity;
        });
  
        const totalEl = document.createElement('div');
        totalEl.innerHTML = `<strong>Total: ₹${total}</strong>`;
        cartSummary.appendChild(totalEl);
      } catch (err) {
        cartSummary.innerHTML = 'Failed to load cart items.';
      }
    }
  
    // Capture address form data
    addressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(addressForm);
      customerInfo = {
        name: formData.get('name'),
        address: formData.get('address'),
        city: formData.get('city'),
        zip: formData.get('zip'),
        phone: formData.get('phone')
      };
      alert('Address saved!');
    });
  
    // Place order
    placeOrderBtn.addEventListener('click', async () => {
      if (!customerInfo.name || !customerInfo.address) {
        alert('Please fill out the address form.');
        return;
      }
  
      const paymentMethod = paymentSelect.value;
      if (!paymentMethod) {
        alert('Please select a payment method.');
        return;
      }
  
      customerInfo.paymentMethod = paymentMethod;
  
      try {
        const response = await fetch(`${API_BASE}/api/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ customerInfo })
        });
  
        const result = await response.json();
        if (response.ok) {
          sessionStorage.setItem('orderDetails', JSON.stringify(result.order));
          window.location.href = 'confirmation.html';
        } else {
          alert(result.message || 'Failed to place order.');
        }
      } catch (err) {
        alert('Error placing order.');
      }
    });
  
    loadCart();
  });
  
  