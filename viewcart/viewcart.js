// Date and Time
const today = new Date();
const nextThreeDays = new Date(today);
nextThreeDays.setDate(today.getDate() + 3);

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayOfWeek = daysOfWeek[nextThreeDays.getDay()];
const date = nextThreeDays.toLocaleDateString();

// Cart JS
// Function to save data to local storage
function saveToLocalStorage(key, newData) {
  let existingData = getFromLocalStorage(key) || [];

  // Check for duplicates and update quantity if product already exists
  newData.forEach(newProduct => {
    const existingProduct = existingData.find(product => product.name === newProduct.name);
    if (existingProduct) {
      existingProduct.quantity = newProduct.quantity;
    } else {
      existingData.push(newProduct);
    }
  });

  localStorage.setItem(key, JSON.stringify(existingData));
}

// Function to retrieve data from local storage
function getFromLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Function to get query parameter
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to display search results
function searchFetch(products) {
  const searchList = document.getElementById("itemsInCart");
  searchList.innerHTML = products.map(product => fetchCartData(product)).join("");

  // Add event listeners for remove buttons
  document.querySelectorAll('.cartItmSfLRmBtn.remove').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.getAttribute('data-name');
      confirmRemoveItem(productName);
    });
  });

  // Add event listeners for quantity buttons
  document.querySelectorAll('.cartItmPMBtn.plus').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.getAttribute('data-name');
      changeItemQuantity(productName, 1);
    });
  });

  document.querySelectorAll('.cartItmPMBtn.minus').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.getAttribute('data-name');
      changeItemQuantity(productName, -1);
    });
  });

  updateCartDisplay(products);
  updatePriceDetail(products);
}

let totalPrice = 0;
let totalItems = 0;

// Function to generate HTML for a cart item
function fetchCartData(item) {
  totalItems += item.quantity;
  totalPrice += item.price * item.quantity;

  return `
  <div class="cartItmListInviewCart bg-white">
    <div class="itemInCart d-flex p-3 m-1">
      <div style="height: 112px; width: 112px;" class="m-3">
        <img src="../json-api/product-img/${item.productImg}" style="width: auto; height: 80px; object-fit: contain;" alt="${item.name}">
      </div>
      <div class="itemDetail">
        <div>
          <p>${item.name}</p>
          <p> Forest Green Strap, Regular</p>
          <p> Seller: Ezig </p>
        </div>
        <div>
          <b>₹${item.price}</b> 1 offer applied
        </div>
      </div>
      <div class="deliveryDate">
        Delivery by ${dayOfWeek}, ${date} | <del>₹40</del> Free
      </div>
    </div>
    <div class="cartItmRmPMdiv container-fluid pt-2 pb-2" style="border-top:1px solid #f1f3f6">
      <div class="row">
        <div class="plusMinItm col-sm-6">
          <div class="d-flex justify-content-center align-items-center">
            <button class="cartItmPMBtn minus" data-name="${item.name}"> – </button>
            <div class="cartItmQty"><input type="text" class="text-center" value="${item.quantity}" style="width:50px" readonly></div>
            <button class="cartItmPMBtn plus" data-name="${item.name}"> + </button>
          </div>
        </div>
        <div class="cartItmSfLRm d-flex justify-content-around align-items-center col-sm-6">
          <div class="cartItmSfLRmBtn">Save for later</div>
          <div class="cartItmSfLRmBtn remove" data-name="${item.name}">Remove</div>
        </div>
      </div>
    </div>
  </div>
  `;
}

// Function to confirm and remove an item from the cart
function confirmRemoveItem(name) {
  const confirmRemove = confirm(`Click OK if you want to remove "${name}" from cart`);
  if (confirmRemove) {
    removeItem(name);
  }
}

// Function to remove an item from the cart
function removeItem(name) {
  let existingData = getFromLocalStorage("filteredProducts") || [];
  const updatedData = existingData.filter(item => item.name !== name);
  localStorage.setItem("filteredProducts", JSON.stringify(updatedData));

  // Update the displayed cart and price details
  searchFetch(updatedData);

  // Show success popup
  showPopup(`"${name}" has been removed from your cart successfully.`);
}

// Function to change the quantity of an item in the cart
function changeItemQuantity(name, change) {
  let existingData = getFromLocalStorage("filteredProducts") || [];
  const updatedData = existingData.map(item => {
    if (item.name === name) {
      item.quantity = Math.max(1, item.quantity + change);
    }
    return item;
  });

  localStorage.setItem("filteredProducts", JSON.stringify(updatedData));

  // Update the displayed cart and price details
  searchFetch(updatedData);
}

// Function to show a popup message
function showPopup(message) {
  const popup = document.getElementById('popupCartItem');
  popup.textContent = message;
  popup.classList.remove('hidden');
  popup.classList.add('visible');
  
  // Hide the popup after 1 second
  setTimeout(() => {
    popup.classList.remove('visible');
    popup.classList.add('hidden');
  }, 3000);
}

// Function to show or hide cart based on product list
function updateCartDisplay(filteredProducts) {
  let cartInProduct = document.getElementById("cardInProduct");
  let cartisEmpty = document.getElementById("cardisEmpty");

  if (filteredProducts.length === 0) {
    cartInProduct.style.display = "none";
    cartisEmpty.style.display = "block";
  } else {
    cartInProduct.style.display = "block";
    cartisEmpty.style.display = "none";
  }
}

// Function to update the price detail section
function updatePriceDetail(products) {
  totalItems = products.reduce((acc, item) => acc + item.quantity, 0);
  totalPrice = products.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let priceDetail = `
    <div style="display: flex; flex-direction: column;">
      <div class="d-flex justify-content-between">
        <div>Price (${totalItems} items) </div>
        <div>₹${totalPrice}</div>
      </div>
      <div class="d-flex justify-content-between">
        <div>Discount </div>
        <div>0</div>
      </div>
      <div class="d-flex justify-content-between">
        <div>Delivery Charges </div>
        <div>Free</div>
      </div>
      <div class="d-flex justify-content-between">
        <div>Total Amount </div>
        <div><b>₹${totalPrice}</b></div>
      </div>
      <div>You will save ₹40 on this order</div>
    </div>
  `;

  document.getElementById("priceDetail").innerHTML = priceDetail;
}

// Fetch data from the JSON file and filter products based on the query
fetch("../json-api/product.json")
  .then(response => response.json())
  .then(data => {
    const query = getQueryParameter("query");
    const filteredProducts = data.filter(product => product.name === query).map(product => ({
      ...product,
      quantity: 1 // Add default quantity
    }));

    // Save filtered products to local storage without overwriting existing data
    saveToLocalStorage("filteredProducts", filteredProducts);

    // Retrieve updated filtered products from local storage
    const savedFilteredProducts = getFromLocalStorage("filteredProducts");

    // Display the filtered products
    searchFetch(savedFilteredProducts);
  })
  .catch(error => console.error("Error fetching data:", error));
