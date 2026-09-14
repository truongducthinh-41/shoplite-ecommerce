let cart = [];

function addToCart(productId, name) {
    const existing = cart.find(i => i.product_id === productId);
    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product_id: productId, name, quantity: 1 });
    }
    renderCart();
}

function renderCart() {
    const div = document.getElementById('cart-items');
    if(cart.length === 0) {
        div.innerHTML = 'Empty';
        return;
    }
    div.innerHTML = cart.map(i => `<div>${i.name} x ${i.quantity}</div>`).join('');
}

document.getElementById('checkout-btn').addEventListener('click', async () => {
    if(cart.length === 0) return alert('Cart is empty');
    
    try {
        const data = await fetchWithAuth('/orders/checkout', {
            method: 'POST',
            body: JSON.stringify({ cartItems: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) })
        });
        
        document.getElementById('checkout-status').innerText = `Success: Order ID ${data.orderId}`;
        cart = [];
        renderCart();
    } catch (error) {
        document.getElementById('checkout-status').innerText = `Error: ${error.message}`;
    }
});
