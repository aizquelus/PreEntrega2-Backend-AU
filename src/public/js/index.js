const socket = io();

// Handle product updates
socket.on('newProductAdded', (product) => {
    const ul = document.querySelector('ul');
    const li = document.createElement('li');
    li.innerHTML = `
        ${product.title} 
        <button onclick="deleteProduct('${product._id}')" id="deleteBtn-${product._id}" type="button">Delete Product</button>
    `;
    ul.appendChild(li);
});

// View product details
const viewProductDetails = async (id) => {
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        if (response.ok) {
            window.location.href = `/products/${id}`; // Redirect to product details page
        } else {
            alert(`Error: ${product.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching product details.');
    }
};

const createCart = async () => {
    try {
        const response = await fetch('/api/carts', { method: 'POST' });
        const data = await response.json();
        if (response.ok) {
            sessionStorage.setItem('cartId', data._id);
            return data._id;
        } else {
            alert(`Error: ${data.error}`);
            return null;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error creating cart.');
        return null;
    }
};

const addToCart = async (productId) => {
    let cartId = sessionStorage.getItem('cartId');
    if (!cartId) {
        cartId = await createCart();
    }

    if (!cartId) return;

    try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, { method: 'POST' });
        const result = await response.json();
        if (response.ok) {
            alert('Product added to cart');
        } else {
            alert(`Error: ${result.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding product to cart.');
    }
};

// Delete product
const deleteProduct = async (id) => {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Product deleted!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.error}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product.');
    }
};

socket.on('productDeleted', id => {
    const productElement = document.getElementById(`deleteBtn-${id}`).parentElement;
    productElement.remove();
});

// Handle form submission for adding new products
const form = document.querySelector('form');

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            if (response.ok) {
                alert('Product added!');
                form.reset();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding product.');
        }
    });
}
