// myStore/FRONT/assets/js/cart-utils.js

// 1. Obtém o carrinho do Local Storage
const getCart = () => {
    return JSON.parse(localStorage.getItem('cart')) || []; 
};

// 2. Salva o carrinho no Local Storage
const saveCart = (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Notifica o contador do cabeçalho para atualizar, se a função existir
    if (window.updateCartCounter) {
        window.updateCartCounter();
    }
};

// 3. Adiciona um produto ao carrinho (chamada pela página de produto)
const addToCart = (productToAdd) => {
    let cart = getCart();
    
    // Procura por um item com o mesmo ID e tamanho (para evitar duplicidade na lista)
    const existingItemIndex = cart.findIndex(item => item.id === productToAdd.id && item.size === productToAdd.size);

    if (existingItemIndex > -1) {
        // Se já existe, apenas aumenta a quantidade
        cart[existingItemIndex].quantity += 1;
    } else {
        // Se não existe, garante que a quantidade é 1 e adiciona o novo item
        if (!productToAdd.quantity || productToAdd.quantity < 1) {
            productToAdd.quantity = 1;
        }
        cart.push(productToAdd);
    }
    
    saveCart(cart);
    alert(`${productToAdd.name} (${productToAdd.size}) adicionado ao carrinho!`);
};

// EXPOSIÇÃO GLOBAL: Torna as funções acessíveis pelo objeto 'window'
window.getCart = getCart;
window.saveCart = saveCart;
window.addToCart = addToCart;

// Inicializa a função de atualização do contador, se existir
if (window.updateCartCounter) {
    window.updateCartCounter();
}