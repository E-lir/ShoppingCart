if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', ready)
}
else{
    ready();
}

function ready(){
    if(document.body.classList.contains('cartPage')){
        displayCartItems();
    }

    //update cart counter
    updateCartCounter();

    // "Add to cart" button listener
    var addToCartButton = document.getElementsByClassName('btn-addToCart');

    for (var i = 0; i < addToCartButton.length; i++){
        var button = addToCartButton[i];
        button.addEventListener('click', addToCart);
    }

    // "closeButton" listener
    var removeCartItemButton = document.getElementsByClassName('closeButton');

    for (var i = 0; i < removeCartItemButton.length; i++){
        var button = removeCartItemButton[i];
        button.addEventListener('click', removeCartItem);
    }

    //"Checkout" button listener
    var checkoutButton = document.getElementsByClassName('btn-checkout')[0];

    if(checkoutButton != null)
        checkoutButton.addEventListener('click', checkout);

    //add listener for row quanitity changes 
    var quanitityInputs = document.getElementsByClassName('cart-quantity-input');

    for (var i = 0; i < quanitityInputs.length; i++){
        var input = quanitityInputs[i];
        input.addEventListener('change', quantityChanged);
    }
}

function addToCart(event){
    var button = event.target;
    var product = button.parentElement;
    var title = product.getElementsByTagName('h3')[0].innerText;
    var price = product.getElementsByTagName('p')[0].innerText;
    var quanitity = "1";
    var imageSource = product.getElementsByTagName('img')[0].src;

    //Check if item is already added to cart
    //if local storage not empty, loop through to search for item title 
    if(localStorage.getItem("cartRows") != null) {
        var cart = JSON.parse(localStorage.getItem("cartRows"));
        for (var i = 0; i < cart.length; i++){
            if(cart[i] == title){
                setTimeout("alert('This item is already added to cart.');", 1);
                return;
            }
        }
        //add item to local storage if title not found
        var cartRow = [title, price, quanitity, imageSource];
        cart = cart.concat(cartRow);
        localStorage.setItem("cartRows", JSON.stringify(cart));

        updateCartCounter();
    }
    else{ //local storage empty, add item to cart
        var cart = [title, price, quanitity, imageSource];
        localStorage.setItem("cartRows", JSON.stringify(cart));

        updateCartCounter();
    }
}

function displayCartItems(){  
    var cart = document.getElementsByClassName('cart')[0];

    //Check if cart is empty
    if(!("cartRows" in localStorage) || JSON.parse(localStorage.getItem("cartRows")).length == 0 ){
        cart.innerHTML = '<img src="images/emptyCart.png" width="100%">';
        return;
    }

    //if not empty, get the cart item data from local storage
    //format is: [item1-title, item1-price, item1-quantity, item1-imgSrc, item2-title, item2-price, item2-quantity, item2-imgSrc, etc.]
    var cartRows = JSON.parse(localStorage.getItem("cartRows"));
    for (var i = 0; i < cartRows.length/4; i++){
        var title = cartRows[i * 4];
        var price = cartRows[(i * 4) + 1];
        var quanitity = cartRows[(i * 4) + 2];
        var imageSource = cartRows[(i * 4) + 3];

        var cartRowContents = `
            <div class="cart-row-item">
                <img class="cart-row-item-image" src="${imageSource}" width="100" height="100">
                <h4 class="cart-row-item-title">${title}</h4>
            </div>
            <h4 class="cart-row-col">${price}</h4>
            <div class="cart-row-col">
                <input class="cart-quantity-input" type="number" value="${quanitity}">
            </div>
            <h4 class="cart-row-col">${price}</h4>
            <div class="cart-row-col-remove">
                <img class="closeButton" src="images/close.png" width="15px" height="15px">
            </div>`

        //create a new <div> for each item in cart
        var cartRow = document.createElement('div');
        cartRow.classList.add("cart-row");
        cartRow.innerHTML = cartRowContents;

        //insert the <div> just before the "total" row
        cart.insertBefore(cartRow, cart.lastElementChild.previousSibling);
        updateRowTotal(cartRow.getElementsByClassName('cart-quantity-input')[0]);
    }
    updateCartTotal();
}

//remove item from cart
function removeCartItem(event){
    var buttonClicked = event.target;
    var rowItem = buttonClicked.parentElement.parentElement.getElementsByClassName("cart-row-item")[0];
    var itemToRemove = rowItem.getElementsByClassName("cart-row-item-title")[0].innerText;

    //remove from local storage
    var cartRows = JSON.parse(localStorage.getItem("cartRows"));
    for (var i = 0; i < cartRows.length; i++){
        if(cartRows[i] == itemToRemove){
            var removed = cartRows.splice(i, 4);
        }
    }
    localStorage.setItem("cartRows", JSON.stringify(cartRows));
    
    //remove row from page
    buttonClicked.parentElement.parentElement.remove();
    updateCartTotal();
    updateCartCounter();

    //Check if cart is empty
    var cart = document.getElementsByClassName('cart')[0];
    if(!("cartRows" in localStorage) || JSON.parse(localStorage.getItem("cartRows")).length == 0 ){
        cart.innerHTML = '<img src="images/emptyCart.png" width="100%">';
        return;
    }
}

//runs when user has clicked quantity change
function quantityChanged(event){
    var input = event.target;
    if(isNaN(input.value) || input.value <= 0){
        input.value = 1;
    }
    //Update local storage
    var rowItem = input.parentElement.parentElement.getElementsByClassName("cart-row-item")[0];
    var itemToUpdate = rowItem.getElementsByClassName("cart-row-item-title")[0].innerText;

    var cartRows = JSON.parse(localStorage.getItem("cartRows"));
    for (var i = 0; i < cartRows.length; i++){
        if(cartRows[i] == itemToUpdate){
            cartRows[i+2] = input.value;
        }
    }
    localStorage.setItem("cartRows", JSON.stringify(cartRows));

    updateRowTotal(input);
}

//update total cost for the row (price * quantity)
function updateRowTotal(input){
    var row = input.parentElement.parentElement;
    var rowPriceEl = row.getElementsByClassName('cart-row-col')[0];
    var rowTotalEl = row.getElementsByClassName('cart-row-col')[2];
    var price = parseFloat(rowPriceEl.innerText.replace('$', ''));
    rowTotalEl.innerText = '$' + Math.round(price * input.value * 100) / 100;

    updateCartTotal();
}

//update total cost for customer
function updateCartTotal(){
    var cartRows = document.getElementsByClassName('cart-row');
    var total = 0;
    for (var i = 1; i < cartRows.length - 1; i++){
        var row = cartRows[i];
        var rowTotalEl = row.getElementsByClassName('cart-row-col')[2];
        var rowTotal = parseFloat(rowTotalEl.innerText.replace('$', ''));
        total += rowTotal;
    }
    total = Math.round(total * 100) / 100;
    document.getElementById('cartTotal').innerText = '$' + total;
}

function checkout(event){
    alert('Thank you for your purchase :)');
}

//toggle menu icon
var menuToggle = function (){
    var menuItems = document.getElementById("menuItems");

    if(menuItems.style.maxHeight == "250px"){
        menuItems.style.maxHeight = "0px";
    }
    else{
        menuItems.style.maxHeight = "250px";
    }
}

//update cart counter
function updateCartCounter(){
    var counter = document.getElementsByClassName('cart-counter')[0];
    if(!("cartRows" in localStorage)){
        counter.innerText = 0;
    }
    else{
        var cartRows = JSON.parse(localStorage.getItem("cartRows"));
        counter.innerText = Math.round(cartRows.length/4);
    }
}