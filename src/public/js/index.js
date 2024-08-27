const socket = io();

socket.on('newProductAdded', (product) => {
    const ul = document.querySelector('ul');
    const li = document.createElement('li');
    li.innerHTML = `${product.title} <button onclick="deleteProduct(${product.id})" id="deleteBtn-${product.id}" type="button">Delete Product</button>`;
    ul.appendChild(li);
});

const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Producto agregado!');
            form.reset();
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
});

const deleteProduct = async (id) => {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Producto eliminado!');
        } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el producto');
    }
};

socket.on('productDeleted', id => {
    const productElement = document.getElementById(`deleteBtn-${id}`).parentElement;
    productElement.remove();
})
