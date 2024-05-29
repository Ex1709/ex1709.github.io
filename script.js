const clientId = '1245453693017522216'; // Replace with your Discord application's client ID
const redirectUri = 'https://ex1709.github.io/'; // Replace with your redirect URI
const discordApiUrl = 'https://discord.com/api';
const loginContainer = document.getElementById('login-container');
const adminLoginContainer = document.getElementById('admin-login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const profileContainer = document.getElementById('profile-info');
const body = document.body;
const productModal = document.getElementById('product-modal');
const modalBody = document.getElementById('modal-body');
const storeUrlInput = document.getElementById('store-url');
const notification = document.getElementById('notification');
const cart = document.getElementById('cart');
const cartItemsContainer = document.getElementById('cart-items');
const profileLink = document.getElementById('profile-link');
const systemLink = document.getElementById('system-link');
const scraperLink = document.getElementById('scraper-link');
const profileSection = document.getElementById('profile-section');
const systemSection = document.getElementById('system-section');
const scraperSection = document.getElementById('scraper-section');
let selectedProducts = [];
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1241151703840067595/nFGMDlUJXMuU6mPCmLWct1XXUoyyo4w0i36C2HH6dhR58YJ2qWBp2dP_YwPSgbBMQoE9';

profileLink.addEventListener('click', () => {
    showSection(profileSection);
});
systemLink.addEventListener('click', () => {
    showSection(systemSection);
});
scraperLink.addEventListener('click', () => {
    showSection(scraperSection);
});

function showSection(section) {
    profileSection.classList.add('hidden');
    systemSection.classList.add('hidden');
    scraperSection.classList.add('hidden');
    section.classList.remove('hidden');
}

function loginWithDiscord() {
    const authUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=identify email`;
    window.location.href = authUrl;
}

function showAdminLogin() {
    loginContainer.classList.add('hidden');
    adminLoginContainer.classList.remove('hidden');
}

function adminLogin() {
    const adminCode = document.getElementById('admin-code').value;
    if (adminCode === '1234') { // Replace with your desired admin code
        adminLoginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden'); // Show the dashboard
        showSection(profileSection); // Default section to show
        logToDiscord(`Admin logged in successfully.`);
    } else {
        showNotification('Invalid admin code.');
    }
}

async function fetchDiscordUserInfo(accessToken) {
    const response = await fetch(`${discordApiUrl}/users/@me`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.json();
}

function handleRedirect() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        fetchDiscordUserInfo(accessToken).then(user => {
            displayUserProfile(user);
            loginContainer.classList.add('hidden');
            dashboardContainer.classList.remove('hidden'); // Show the dashboard
            showSection(profileSection); // Default section to show
            logToDiscord(`Login successful for user: ${user.username}`);
        }).catch(error => {
            console.error('Error fetching user info:', error);
            showNotification('Der opstod en fejl under login.');
        });
    }
}

function displayUserProfile(user) {
    profileContainer.innerHTML = `
        <p>Brugernavn: ${user.username}</p>
        <p>Email: ${user.email}</p>
        <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Profilbillede" class="rounded-full w-16 h-16">
    `;
}

function logToDiscord(message) {
    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content: message,
        }),
    })
    .then(response => response.json())
    .then(data => console.log('Succesfuldt logget til Discord:', data))
    .catch(error => console.error('Fejl ved logning til Discord:', error));
}

function setTheme(theme) {
    const themes = {
        'glowing-purple': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #6a0dad',
            buttonBackgroundColor: '#6a0dad',
            buttonHoverBackgroundColor: '#4b0082'
        },
        'glowing-blue': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #004ac2',
            buttonBackgroundColor: '#004ac2',
            buttonHoverBackgroundColor: '#003399'
        },
        'glowing-red': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #ff0000',
            buttonBackgroundColor: '#ff0000',
            buttonHoverBackgroundColor: '#cc0000'
        },
        'glowing-yellow': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #ffeb3b',
            buttonBackgroundColor: '#ffeb3b',
            buttonHoverBackgroundColor: '#ffd700'
        },
        'glowing-green': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #00ff00',
            buttonBackgroundColor: '#00ff00',
            buttonHoverBackgroundColor: '#00cc00'
        },
        'glowing-pink': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #ff00ff',
            buttonBackgroundColor: '#ff00ff',
            buttonHoverBackgroundColor: '#cc00cc'
        },
        'glowing-orange': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #ff6600',
            buttonBackgroundColor: '#ff6600',
            buttonHoverBackgroundColor: '#cc5200'
        },
        'glowing-teal': {
            backgroundColor: '#121212',
            color: '#ffffff',
            boxShadow: '0 0 10px #00ffff',
            buttonBackgroundColor: '#00ffff',
            buttonHoverBackgroundColor: '#00cccc'
        }
    };

    const themeStyles = themes[theme];

    body.style.backgroundColor = themeStyles.backgroundColor;
    body.style.color = themeStyles.color;
    document.querySelectorAll('.product').forEach(el => {
        el.style.backgroundColor = '#2e2e2e';
        el.style.color = '#ffffff';
        el.style.boxShadow = themeStyles.boxShadow;
    });
    document.querySelectorAll('button').forEach(btn => {
        btn.style.backgroundColor = themeStyles.buttonBackgroundColor;
        btn.onmouseover = () => btn.style.backgroundColor = themeStyles.buttonHoverBackgroundColor;
        btn.onmouseout = () => btn.style.backgroundColor = themeStyles.buttonBackgroundColor;
    });
}

async function fetchAllProducts(storeUrl) {
    let products = [];
    let page = 1;
    let hasMoreProducts = true;

    while (hasMoreProducts) {
        const response = await fetch(`${storeUrl}/products.json?page=${page}&limit=250`);
        const data = await response.json();
        products = products.concat(data.products);

        if (data.products.length < 250) {
            hasMoreProducts = false;
        } else {
            page++;
        }
    }

    return products;
}

async function scanAllProducts() {
    const storeUrl = storeUrlInput.value;
    const onlyInStock = document.getElementById('only-in-stock').checked;
    const onlyOutOfStock = document.getElementById('only-out-of-stock').checked;
    const only100Percent = document.getElementById('only-100-percent').checked;

    if (!storeUrl) {
        showNotification('Indsæt venligst en Shopify butik URL.');
        return;
    }

    document.getElementById('loading').classList.remove('hidden');

    const products = await fetchAllProducts(storeUrl);

    document.getElementById('loading').classList.add('hidden');
    displayDiscountCards(products, storeUrl, onlyInStock, onlyOutOfStock, only100Percent);
}

function displayDiscountCards(products, storeUrl, onlyInStock, onlyOutOfStock, only100Percent) {
    const discountTabsContainer = document.getElementById('discount-tabs');
    discountTabsContainer.innerHTML = '';

    const discounts = products.reduce((acc, product) => {
        const price = parseFloat(product.variants[0].price);
        const compareAtPrice = parseFloat(product.variants[0].compare_at_price || price);
        const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
        const available = product.variants[0].available;

        if ((onlyInStock && !available) || (onlyOutOfStock && available) || (only100Percent && discount < 100)) {
            return acc;
        }

        if (discount > 0) {
            const discountKey = Math.floor(discount);
            if (!acc[discountKey]) acc[discountKey] = [];
            acc[discountKey].push(product);
        }

        return acc;
    }, {});

    Object.keys(discounts)
        .sort((a, b) => b - a)
        .forEach(discountKey => {
            const discountCard = document.createElement('div');
            discountCard.classList.add('discount-card', 'p-4', 'rounded', 'bg-gray-800', 'hover:bg-gray-700', 'cursor-pointer', 'mb-4', 'shadow-md', 'text-center');
            discountCard.innerHTML = `
                <h2 class="text-xl font-bold mb-2">${discountKey}% Rabat</h2>
                <p>(${discounts[discountKey].length} produkter)</p>
            `;
            discountCard.onclick = () => openModal(discounts[discountKey], storeUrl);
            discountTabsContainer.appendChild(discountCard);
        });
}

function openModal(products, storeUrl) {
    modalBody.innerHTML = '';

    products.forEach(product => {
        const price = parseFloat(product.variants[0].price);
        const compareAtPrice = parseFloat(product.variants[0].compare_at_price || price);
        const available = product.variants[0].available;
        const variantId = product.variants[0].id;

        const productElement = document.createElement('div');
        productElement.classList.add('product', 'p-4', 'rounded', 'bg-gray-800', 'mb-4', 'shadow-md');
        productElement.innerHTML = `
            <h3 class="text-lg font-bold">${product.title}</h3>
            <p>Pris: ${price} DKK</p>
            <p>Tidligere Pris: ${compareAtPrice} DKK</p>
            <p class="${available ? 'text-green-500' : 'text-red-500'}">${available ? 'På Lager' : 'Udsolgt'}</p>
            <div class="product-options mt-4">
                <label for="quantity-${variantId}" class="block mb-2">Antal:</label>
                <input type="number" id="quantity-${variantId}" value="1" min="1" class="p-2 rounded text-black">
                <button onclick="selectProduct('${variantId}')" class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Vælg</button>
            </div>
        `;
        modalBody.appendChild(productElement);
    });

    productModal.classList.remove('hidden');
    productModal.style.display = 'block';
}

function selectProduct(variantId) {
    const quantityInput = document.getElementById(`quantity-${variantId}`);
    const quantity = quantityInput.value;

    if (quantity > 0) {
        const productIndex = selectedProducts.findIndex(p => p.variantId === variantId);
        if (productIndex > -1) {
            selectedProducts[productIndex].quantity = quantity;
        } else {
            selectedProducts.push({ variantId, quantity });
        }
        updateCart();
        showNotification('Produkt valgt!');
    } else {
        showNotification('Indtast venligst en gyldig mængde.');
    }
}

function updateCart() {
    cartItemsContainer.innerHTML = '';
    selectedProducts.forEach(product => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item', 'flex', 'justify-between', 'items-center', 'mb-2');
        cartItem.innerHTML = `
            <span>${product.variantId}</span>
            <input type="number" value="${product.quantity}" min="1" onchange="updateProductQuantity('${product.variantId}', this.value)" class="p-2 rounded text-black w-16">
            <button onclick="removeProductFromCart('${product.variantId}')" class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">Fjern</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });
}

function updateProductQuantity(variantId, quantity) {
    const productIndex = selectedProducts.findIndex(p => p.variantId === variantId);
    if (productIndex > -1) {
        selectedProducts[productIndex].quantity = quantity;
        showNotification('Produkt mængde opdateret!');
    }
}

function removeProductFromCart(variantId) {
    selectedProducts = selectedProducts.filter(p => p.variantId !== variantId);
    updateCart();
    showNotification('Produkt fjernet fra kurv!');
}

function generateDirectBuyLink() {
    const storeUrl = storeUrlInput.value;
    const directBuyLink = `${storeUrl}/cart/${selectedProducts.map(p => `${p.variantId}:${p.quantity}`).join(',')}?payment=shop_pay`;

    navigator.clipboard.writeText(directBuyLink).then(() => {
        showNotification('Direkte køb link kopieret til udklipsholder!');
    });

    closeModal();
}

function closeModal() {
    productModal.classList.add('hidden');
    productModal.style.display = 'none';
}

function showNotification(message) {
    notification.textContent = message;
    notification.classList.remove('hidden');
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 3000);
}

handleRedirect();
