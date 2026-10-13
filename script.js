/* =====================================================
   Campus Convenience Store POS - script.js
   Sections: 1 Data | 2 Page elements | 3 Helpers
             4 Products | 5 Cart | 6 Payment | 7 Receipt
             8 New transaction | 9 Event listeners | 10 Start
   ===================================================== */

/* ---------- 1. DATA ---------- */

// The six products from Scenario 5 (prices are in pesos)
const products = [
  { id: 1, name: "Instant Noodles",  price: 18, category: "Snacks",          icon: "\u{1F35C}" },
  { id: 2, name: "Potato Chips",     price: 25, category: "Snacks",          icon: "\u{1F35F}" },
  { id: 3, name: "Soft Drink (Can)", price: 25, category: "Beverages",       icon: "\u{1F964}" },
  { id: 4, name: "Bottled Water",    price: 20, category: "Beverages",       icon: "\u{1F4A7}" },
  { id: 5, name: "Ballpen (piece)",  price: 12, category: "School Supplies", icon: "\u{1F58A}\uFE0F" },
  { id: 6, name: "Notebook (piece)", price: 35, category: "School Supplies", icon: "\u{1F4D3}" }
];

// The cart holds items like: { id, name, price, quantity }
let cart = [];

// Counts successful transactions (used for the reference number)
let transactionCount = 0;

// true after payment is confirmed, so the finished sale cannot be changed
let transactionLocked = false;

/* ---------- 2. PAGE ELEMENTS ---------- */
// We find each HTML element once, using the ids from index.html

const productGrid     = document.getElementById("product-grid");
const emptyCartMsg    = document.getElementById("empty-cart-message");
const cartTable       = document.getElementById("cart-table");
const cartItems       = document.getElementById("cart-items");
const cartTotal       = document.getElementById("cart-total");

const amountDue       = document.getElementById("amount-due");
const cashInput       = document.getElementById("cash-input");
const changeAmount    = document.getElementById("change-amount");
const paymentMessage  = document.getElementById("payment-message");
const confirmBtn      = document.getElementById("confirm-btn");

const confirmation    = document.getElementById("confirmation");
const confirmRef      = document.getElementById("confirm-ref");
const confirmTotal    = document.getElementById("confirm-total");
const confirmPaid     = document.getElementById("confirm-paid");
const confirmChange   = document.getElementById("confirm-change");

const receiptSection  = document.getElementById("receipt-section");
const receiptRef      = document.getElementById("receipt-ref");
const receiptDate     = document.getElementById("receipt-date");
const receiptItems    = document.getElementById("receipt-items");
const receiptTotal    = document.getElementById("receipt-total");
const receiptPaid     = document.getElementById("receipt-paid");
const receiptChange   = document.getElementById("receipt-change");
const newTransactionBtn = document.getElementById("new-transaction-btn");
const searchInput     = document.getElementById("search-input");
const clearCartBtn    = document.getElementById("clear-cart-btn");
const clockEl         = document.getElementById("clock");
const navLinks        = document.querySelectorAll(".nav-link");

/* ---------- 3. HELPER FUNCTIONS ---------- */

// Round to 2 decimal places to avoid JavaScript decimal errors (like 0.1 + 0.2)
function roundMoney(amount) {
  return Math.round(amount * 100) / 100;
}

// Show a number as pesos with two decimals: 97 -> "₱97.00"
// "\u20B1" is the peso sign
function formatMoney(amount) {
  return "\u20B1" + amount.toFixed(2);
}

// Add up every item's price x quantity
function getCartTotal() {
  let total = 0;
  for (const item of cart) {
    total += item.price * item.quantity;
  }
  return roundMoney(total);
}

// Show a message under the cash input. type is "error" or "success"
function showMessage(text, type) {
  paymentMessage.textContent = text;
  paymentMessage.className = "message " + type;
}

// Clear the message and set the change display back to zero
function resetPaymentFeedback() {
  paymentMessage.textContent = "";
  paymentMessage.className = "message";
  changeAmount.textContent = formatMoney(0);
}

// Make a reference number like TXN-20261013-0001
function generateReference() {
  const now = new Date();
  const year  = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day   = String(now.getDate()).padStart(2, "0");
  const number = String(transactionCount).padStart(4, "0");
  return "TXN-" + year + month + day + "-" + number;
}

// Turn the checkout controls on or off (used after payment and on reset)
function setCheckoutLocked(isLocked) {
  transactionLocked = isLocked;
  cashInput.disabled = isLocked;
  confirmBtn.disabled = isLocked;
  clearCartBtn.disabled = isLocked;

  const addButtons = productGrid.querySelectorAll("button");
  for (const button of addButtons) {
    button.disabled = isLocked;
  }
}

/* ---------- 4. PRODUCTS (Step 1: Browse Products) ---------- */

function renderProducts(filterText = "") {
  const search = filterText.trim().toLowerCase();
  const shown = products.filter(p =>
    p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));

  if (shown.length === 0) {
    productGrid.innerHTML = '<p class="placeholder">No products match your search.</p>';
    return;
  }

  const disabled = transactionLocked ? "disabled" : "";
  let html = "";
  for (const product of shown) {
    html += `
      <article class="product-card">
        <div class="product-image" aria-hidden="true">${product.icon}</div>
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatMoney(product.price)}</p>
        <button type="button" class="btn btn-accent" data-id="${product.id}" ${disabled}>&#128722; Add to Cart</button>
      </article>`;
  }
  productGrid.innerHTML = html;
}

/* ---------- 5. CART (Steps 2 & 3: Add to Cart, Review Order) ---------- */

// Add a product. If it is already in the cart, increase its quantity.
function addToCart(productId) {
  if (transactionLocked) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = products.find(p => p.id === productId);
    cart.push({ id: product.id, name: product.name, price: product.price, icon: product.icon, quantity: 1 });
  }

  resetPaymentFeedback();
  renderCart();
}

// Change quantity by +1 or -1. Quantity never goes below 1.
function changeQuantity(productId, amount) {
  if (transactionLocked) return;

  const item = cart.find(i => i.id === productId);
  if (!item) return;

  const newQuantity = item.quantity + amount;
  if (newQuantity < 1) return;

  item.quantity = newQuantity;
  resetPaymentFeedback();
  renderCart();
}

// Remove a product completely
function removeFromCart(productId) {
  if (transactionLocked) return;

  cart = cart.filter(item => item.id !== productId);
  resetPaymentFeedback();
  renderCart();
}

// Redraw the cart table and update the totals
function renderCart() {
  const total = getCartTotal();
  const locked = transactionLocked ? "disabled" : "";

  if (cart.length === 0) {
    emptyCartMsg.hidden = false;
    cartTable.hidden = true;
  } else {
    emptyCartMsg.hidden = true;
    cartTable.hidden = false;
  }

  let html = "";
  for (const item of cart) {
    const subtotal = roundMoney(item.price * item.quantity);
    const minusDisabled = (item.quantity === 1 || transactionLocked) ? "disabled" : "";

    html += `
      <tr>
        <td><span class="item-cell"><span class="item-icon" aria-hidden="true">${item.icon}</span>${item.name}</span></td>
        <td>${formatMoney(item.price)}</td>
        <td>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}"
                    aria-label="Decrease quantity of ${item.name}" ${minusDisabled}>&minus;</button>
            <span class="qty-value">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}"
                    aria-label="Increase quantity of ${item.name}" ${locked}>+</button>
          </div>
        </td>
        <td>${formatMoney(subtotal)}</td>
        <td>
          <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}"
                  aria-label="Remove ${item.name} from cart" ${locked}>Remove</button>
        </td>
      </tr>`;
  }
  cartItems.innerHTML = html;

  cartTotal.textContent = formatMoney(total);
  amountDue.textContent = formatMoney(total);
}

/* ---------- 6. PAYMENT (Steps 4, 5 & 6) ---------- */

// Check the cash input. Returns { valid, message, amount }
function validateCash(rawValue, total) {
  const text = rawValue.trim();

  if (cart.length === 0) {
    return { valid: false, message: "The cart is empty. Add at least one product before paying." };
  }

  if (text === "") {
    return { valid: false, message: "Please enter the cash received from the customer." };
  }

  // Only digits with an optional decimal point (and an optional minus sign)
  const looksNumeric = /^-?(\d+\.?\d*|\.\d+)$/.test(text);
  if (!looksNumeric) {
    return { valid: false, message: "Invalid amount. Please enter numbers only, for example 100 or 100.50." };
  }

  const amount = Number(text);

  if (amount < 0) {
    return { valid: false, message: "Cash received cannot be negative." };
  }

  if (text.includes(".") && text.split(".")[1].length > 2) {
    return { valid: false, message: "Cash received can have at most two decimal places." };
  }

  if (roundMoney(amount) < total) {
    const shortBy = roundMoney(total - amount);
    return {
      valid: false,
      message: "Insufficient payment. The total is " + formatMoney(total) +
               ", short by " + formatMoney(shortBy) + "."
    };
  }

  return { valid: true, amount: roundMoney(amount) };
}

// Runs when the cashier clicks Confirm Payment
function confirmPayment() {
  if (transactionLocked) return;

  const total = getCartTotal();
  const result = validateCash(cashInput.value, total);

  // Step 5: if invalid, show the error and stop
  if (!result.valid) {
    showMessage(result.message, "error");
    changeAmount.textContent = formatMoney(0);
    return;
  }

  // Step 5: Change = Amount Paid - Total Amount
  const change = roundMoney(result.amount - total);

  // Save a copy of the sale so the receipt can never change afterward
  transactionCount += 1;
  const transaction = {
    reference: generateReference(),
    date: new Date().toLocaleString("en-PH"),
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: roundMoney(item.price * item.quantity)
    })),
    total: total,
    paid: result.amount,
    change: change
  };

  // Lock the sale, then show the confirmation and receipt
  setCheckoutLocked(true);
  renderCart();
  resetPaymentFeedback();
  changeAmount.textContent = formatMoney(change);

  showConfirmation(transaction);
  showReceipt(transaction);
}

// Step 6: payment confirmation box
function showConfirmation(transaction) {
  confirmRef.textContent    = transaction.reference;
  confirmTotal.textContent  = formatMoney(transaction.total);
  confirmPaid.textContent   = formatMoney(transaction.paid);
  confirmChange.textContent = formatMoney(transaction.change);
  confirmation.hidden = false;
}

/* ---------- 7. RECEIPT (Step 7) ---------- */

function showReceipt(transaction) {
  receiptRef.textContent  = transaction.reference;
  receiptDate.textContent = transaction.date;

  let html = "";
  for (const item of transaction.items) {
    html += `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatMoney(item.price)}</td>
        <td>${formatMoney(item.subtotal)}</td>
      </tr>`;
  }
  receiptItems.innerHTML = html;

  receiptTotal.textContent  = formatMoney(transaction.total);
  receiptPaid.textContent   = formatMoney(transaction.paid);
  receiptChange.textContent = formatMoney(transaction.change);

  receiptSection.hidden = false;
  receiptSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

/* ---------- 8. NEW TRANSACTION ---------- */

function startNewTransaction() {
  cart = [];                       // clear cart and quantities
  cashInput.value = "";            // clear payment input
  confirmation.hidden = true;      // hide payment confirmation
  receiptSection.hidden = true;    // hide previous receipt
  receiptItems.innerHTML = "";
  receiptRef.textContent = "";
  receiptDate.textContent = "";

  setCheckoutLocked(false);        // let the cashier use the controls again
  resetPaymentFeedback();
  renderCart();
  searchInput.value = "";
  renderProducts();
  cashInput.focus();
}

// Empty the whole cart (Clear Cart button)
function clearCart() {
  if (transactionLocked) return;
  cart = [];
  resetPaymentFeedback();
  renderCart();
}

// Show the current date and time in the header
function updateClock() {
  clockEl.textContent = new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

/* ---------- 9. EVENT LISTENERS ---------- */

// One listener on the product grid handles every "Add to Cart" button
productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;
  addToCart(Number(button.dataset.id));
});

// One listener on the cart handles +, - and Remove buttons
cartItems.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "increase") changeQuantity(id, 1);
  if (action === "decrease") changeQuantity(id, -1);
  if (action === "remove")   removeFromCart(id);
});

confirmBtn.addEventListener("click", confirmPayment);

// Pressing Enter in the cash box also confirms payment
cashInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") confirmPayment();
});

// Typing a new amount clears the old error message
cashInput.addEventListener("input", function () {
  paymentMessage.textContent = "";
  paymentMessage.className = "message";
});

newTransactionBtn.addEventListener("click", startNewTransaction);
clearCartBtn.addEventListener("click", clearCart);

// Search box filters the product cards as you type
searchInput.addEventListener("input", function () {
  renderProducts(searchInput.value);
});

// Highlight the sidebar link that was clicked
for (const link of navLinks) {
  link.addEventListener("click", function () {
    for (const other of navLinks) other.classList.remove("active");
    link.classList.add("active");
  });
}

/* ---------- 10. START THE APP ---------- */
renderProducts();
renderCart();
resetPaymentFeedback();
updateClock();
setInterval(updateClock, 30000);
