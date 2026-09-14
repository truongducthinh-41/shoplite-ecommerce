document.getElementById('load-products-btn').addEventListener('click', async () => {
    try {
        const products = await fetchWithAuth('/products');
        const list = document.getElementById('products-list');
        list.innerHTML = products.map(p => `
            <div>
                <strong>${p.name}</strong> - $${p.price} (Stock: ${p.stock})
                <button onclick="addToCart(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Add to Cart</button>
            </div>
        `).join('');
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('get-recs-btn').addEventListener('click', async () => {
    const productId = document.getElementById('rec-product-id').value;
    try {
        const data = await fetchWithAuth(`/products/${productId}/recommendations`);
        const list = document.getElementById('recs-list');
        list.innerHTML = `<i>Algorithm used: ${data.type}</i><ul>` + 
            data.recommendations.map(p => `<li>ID: ${p.id} - ${p.name} ($${p.price})</li>`).join('') + 
            `</ul>`;
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('load-admin-btn').addEventListener('click', async () => {
    try {
        const data = await fetchWithAuth('/admin/dashboard');
        document.getElementById('admin-data').innerText = JSON.stringify(data, null, 2);
    } catch (error) {
        alert(error.message);
    }
});
