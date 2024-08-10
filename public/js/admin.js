const socket = io();

function updateStatus(orderId, selectElement) {
    const newStatus = selectElement.value;
    axios.put(`/admin/order-status/${orderId}`, {orderStatus: newStatus})
    .then((response)=> {
        console.log(response);
        socket.emit('orderStatus', newStatus, orderId)
    })
    .catch((error) => {
        alert('Error updating order status:', error.message);
    });
}

function addOrderRow(orderId, customerName, products, status) {
    const tbody = document.querySelector('tbody');
    const tr = document.createElement('tr');

    const orderCell = document.createElement('td');
    orderCell.innerHTML = `<div class="order-id">Order ID: ${orderId}</div><div class="products">
        ${products.map(product => `<div>- ${product.product.name}</div>`).join('')}</div>`;

    tr.appendChild(orderCell);

    const customerCell = document.createElement('td');
    customerCell.textContent = customerName;
    tr.appendChild(customerCell);

    const statusCell = document.createElement('td');
    const select = document.createElement('select');
    const statuses = ['Order Placed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
    statuses.forEach(s => {
        const option = document.createElement('option');
        option.value = s;
        option.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        if (s === status) {
            option.selected = true;
        }
        select.appendChild(option);
    });
    select.onchange = () => updateStatus(orderId, select);
    statusCell.appendChild(select);
    tr.appendChild(statusCell);

    tbody.appendChild(tr);
}

// Example of dynamically adding an order
window.onload = async function() {
    const response = await axios.get('/admin/all-orders');
    if(response.status == 201){
        const orders = response.data.orders;
        console.log(orders)
        orders.forEach((order)=>{
            addOrderRow(order._id, order.user.name, order.products, order.orderStatus)
        })
        
    }
};