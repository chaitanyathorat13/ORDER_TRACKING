const socket = io();

socket.on('orderStatus', async (status, orderId) => {
    const openOrderId = document.getElementById('orderId').value;
    if (orderId === openOrderId) {
        updateOrderStatus(status)
    }
});

// Function to render orders
function renderOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = ''; // Clear the list before rendering

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order';

        const orderIdTitle = document.createElement('h3');
        orderIdTitle.textContent = `Order ID: ${order._id}`;
        orderDiv.appendChild(orderIdTitle);

        const productList = document.createElement('ul');
        order.products.forEach(product => {
            const productItem = document.createElement('li');
            productItem.textContent = product.product.name;
            productList.appendChild(productItem);
        });
        orderDiv.appendChild(productList);

        const trackButton = document.createElement('button');
        trackButton.textContent = 'Track Order';
        trackButton.addEventListener('click', async () => {
            document.getElementById('orderId').value = order._id;
            const token = localStorage.getItem('token')
            const statusResponse = await axios.get(`/shop/order-status/${order._id}`,
             { headers: { "Authorization": token } });
             
            if(statusResponse){
                showModal(statusResponse.data.currentStatus);
            }
            
        });
        orderDiv.appendChild(trackButton);

        ordersList.appendChild(orderDiv);
    });
}


function updateOrderStatus(currentStatus){
    const trackingSteps = document.querySelectorAll('.tracking-step');

    let statusReached = false;
    let isAfterCurrentStatus = false;

    trackingSteps.forEach(step => {
        const status = step.getAttribute('data-status');
        if (status === currentStatus) {
            statusReached = true;
        }

        if (!statusReached && !isAfterCurrentStatus) {
            step.classList.add('completed');
        }
        else if(statusReached && !isAfterCurrentStatus){
            step.classList.add('completed');
            isAfterCurrentStatus = true;
        }
        else{
            step.classList.remove('completed')
        }
    });
}

// Function to handle showing the modal with tracking information
function showModal(currentStatus) {
   
    const modal = document.getElementById('tracking-modal');
    modal.style.display = "block";
    updateOrderStatus(currentStatus)
}

// Close the modal when the user clicks on <span> (x)
document.querySelector('.close').onclick = function() {
    document.getElementById('tracking-modal').style.display = "none";
}

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    const modal = document.getElementById('tracking-modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// // Initialize the order rendering on page load
// document.addEventListener('DOMContentLoaded', renderOrders);
