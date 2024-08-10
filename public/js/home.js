
let user = null;

async function showHome() {
    document.getElementById('home').style.display = 'block';
    document.getElementById('signin').style.display = 'none';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
    displayProducts();
    const token = localStorage.getItem('token');
    if (token) {
        const isauthenthic = await isUserAuthorized(token);
        if (isauthenthic) {
            user = token;
            updateNavBtns();
        }
    }
}

async function isUserAuthorized(token) {
    const response = await axios.get('/shop/check-user', { headers: { "Authorization": token } });
    return response.data.authentic;
}

function showSignIn() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('signin').style.display = 'block';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
}

function showSignUp() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('signin').style.display = 'none';
    document.getElementById('signup').style.display = 'block';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders-section').style.display = 'none';
}

function showCart() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('signin').style.display = 'none';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('cart').style.display = 'block';
    document.getElementById('orders-section').style.display = 'none';
    handleCartDisplay();

}

function showOrdersPage(){
    document.getElementById('home').style.display = 'none';
    document.getElementById('signin').style.display = 'none';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('cart').style.display = 'none';
    document.getElementById('orders-section').style.display = 'block';
    getUserOrders();
}


async function getUserOrders(){
    const resp = await axios.get('shop/orders', 
    { headers: { "Authorization": localStorage.getItem('token') } });
    
    console.log(resp)
    renderOrders(resp.data.orders)
}

async function handleCartDisplay() {

    if (!user && !localStorage.getItem('token')) {
        const guestCart = localStorage.getItem('guestCart');
        if (guestCart) {
            displayCartItems(JSON.parse(guestCart));
        }

    }
    else {
        const guestCart = localStorage.getItem('guestCart');
        const token = localStorage.getItem('token');
        if (guestCart) {
            const parsedGuestCart = JSON.parse(guestCart);
            console.log(parsedGuestCart)
            const response = await axios.post('/shop/guest-cart', { parsedGuestCart },
                { headers: { "Authorization": token } });

            if (response) {
                localStorage.removeItem('guestCart');
                console.log(response);
                displayCartItems(response.data.mergedCart)
            }

        }
        else {
            const cartItems = await axios.get('/shop/cart', { headers: { "Authorization": token } });
            console.log(cartItems)
            displayCartItems(cartItems.data.cart);
        }

    }
}

async function displayProducts() {
    const productsRes = await axios.get('/shop/products');
    const products = productsRes.data.products
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    products.forEach((product) => {
        const productDiv = document.createElement('div');
        productDiv.className = 'product';
        productDiv.innerHTML = `
                    <h2>${product.name}</h2>
                    <p>${product.category}</p>
                    <button class="add-to-cart">Add to Cart</button>`;

        productsContainer.appendChild(productDiv);
        const addButton = productDiv.querySelector('.add-to-cart');
        addButton.addEventListener('click', () => addToCart(product));
    });
}

async function addToCart(product) {

    const guestCart = localStorage.getItem('guestCart');
    if (!user && (!localStorage.getItem('token'))) {
        if (guestCart) {
            const parsedGuestCart = JSON.parse(guestCart);
            const prodIndex = parsedGuestCart.findIndex(p => p.productId == product.productId);
            if (prodIndex >= 0) {
                const newQuantity = Number(parsedGuestCart[prodIndex].quantity) + 1;
                parsedGuestCart[prodIndex].quantity = newQuantity;
            }
            else {
                parsedGuestCart.push({ ...product, quantity: 1 })
            }

            localStorage.setItem('guestCart', JSON.stringify(parsedGuestCart))
        }
        else {
            const guestCart = [];
            guestCart.push({ ...product, quantity: 1 });
            localStorage.setItem('guestCart', JSON.stringify(guestCart))
        }

        alert('Product added to cart');
    }
    else {
        let token = localStorage.getItem('token')
        const response = await axios.post('/shop/cart', { productId: product._id },
            { headers: { "Authorization": token } });
        alert(response.data.message);
    }

}



function displayCartItems(cart) {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
                    <h2>${item.name}</h2>
                    <p>${item.category}</p>
                    <p>Quantity: <input type="number" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)"></p>
                    <button class="delete-btn">Delete</button>
                    `;
        cartContainer.appendChild(itemDiv);

        const deleteBtn = itemDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteFromCart(item));
    });
}

function updateQuantity(productId, quantity) {
    const product = cart.find(p => p.productId === productId);
    product.quantity = quantity;
}

async function deleteFromCart(product) {
    if (!user && !localStorage.getItem('token')) {
        const guestCart = localStorage.getItem('guestCart');
        updatedGuestCart = JSON.parse(guestCart).filter(p => p.productId != product.productId)
        displayCartItems(updatedGuestCart);
        alert("Selected item has been deleted");
        localStorage.setItem('guestCart', JSON.stringify(updatedGuestCart));
    }
    else {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`/shop/cart/${product._id}`, {
            headers: { "Authorization": token }
        });
        if (response) {
            console.log(response);
            displayCartItems(response.data.updatedCart);
            alert("Selected item has been deleted");
        }

    }

}


function updateNavBtns() {
    const authLinks = document.getElementById('authlinks');
    if (user) {
        authLinks.innerHTML = `<button id="navbtns" href="#" onclick="showOrdersPage()"><b>Orders</b></button>
        <button id="navbtns" href="#" onclick="showCart()"><b>Cart</b></button>
        <button id="navbtns" href="#" onclick="signOutUser()"><b>Logout</b></button>`;
    } else {
        authLinks.innerHTML = `
        <button id="navbtns" href="#" onclick="showSignUp()"><b>Sign Up</b></button>
        <button id="navbtns" href="#" onclick="showSignIn()"><b>Login</b></button>
        <button id="navbtns" href="#" onclick="showCart()"><b>Cart</b></button>`;
    }
}



function signIn(e) {
    e.preventDefault();
    const { email, password } = e.target;

    loginDetails = {
        email: email.value,
        password: password.value
    }

    axios.post(`user/sign-in`, loginDetails)
        .then((res) => {

            if (res.status == 200) {
                localStorage.setItem('token', res.data.token)
                alert(res.data.message);
                user = localStorage.getItem('token');
                updateNavBtns()
                showCart();
            }
            else {
                throw new Error('failed to login')
            }
        })
        .catch(err => {
            handleError(e.target, err.response.data.error);
        })
}




function signUp(e) {
    e.preventDefault();

    const { username, email, password } = e.target;

    const signupDetails = {
        username: username.value,
        email: email.value,
        password: password.value,
    }

    axios.post(`user/sign-up`, signupDetails)
        .then((res) => {
            if (res.status == 201) {
                showSignIn();
            }
            else {
                throw new Error('failed to login')
            }
        })
        .catch(err => {
            handleError(e.target, err.response.data.error);
        })
}


function handleError(target, error) {
    const existingErrorMessages = target.querySelectorAll('p');
    existingErrorMessages.forEach((errMessage) => {
        if (errMessage.id === 'errorMessage') {
            errMessage.remove();
        }
    });

    let errMessage = document.createElement('p');
    errMessage.id = 'errorMessage';
    errMessage.innerHTML = error;
    errMessage.style.color = 'red';
    errMessage.style.textDecoration = 'underline'
    target.append(errMessage);
}

async function checkout() {
    const cartItems = document.getElementById('cart-items');

    if(!cartItems.hasChildNodes()){
        alert('cart is empty');
        return;
    }

    if (!user && !localStorage.getItem('token')) {
        alert('Please sign in to proceed');
        showSignIn();
    } else {
        alert('Proceeding to checkout');
        const token = localStorage.getItem('token')
        const response = await axios.post('/shop/create-order', {}, { headers: { "Authorization": token } });
        if(response.status == 200){
            showOrdersPage();
        }
        
    }
}


function signOutUser() {
    localStorage.removeItem('token');
    user = null;
    document.getElementById('cart-items').innerHTML = '';
    updateNavBtns();
    showHome()
}

showHome(); // Initialize with home page
