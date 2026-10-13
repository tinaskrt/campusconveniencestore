/* =====================================================
   Campus Convenience Store POS - script.js
   Sections: 1 Data | 2 Page elements | 3 Helpers
             4 Products | 5 Cart | 6 Payment | 7 Receipt
             8 New transaction | 9 Navigation & header
             10 Event listeners | 11 Start
   ===================================================== */

/* ---------- 1. DATA ---------- */

// The six products from Scenario 5 (prices are in pesos)
const products = [
  { id: 1, name: "Instant Noodles",  price: 18, category: "Snacks" },
  { id: 2, name: "Potato Chips",     price: 25, category: "Snacks" },
  { id: 3, name: "Soft Drink (Can)", price: 25, category: "Beverages" },
  { id: 4, name: "Bottled Water",    price: 20, category: "Beverages" },
  { id: 5, name: "Ballpen (piece)",  price: 12, category: "School Supplies" },
  { id: 6, name: "Notebook (piece)", price: 35, category: "School Supplies" }
];

// Product artwork (inline SVG, no external image files needed)
const ART = {
  1: '<path d="M18 48h84l-12 80H30z" fill="#C8102E"/><path d="M24 74h72l-3 26H27z" fill="#FFD329"/><ellipse cx="60" cy="48" rx="42" ry="8" fill="#fff"/><path d="M34 46c4-20 14-20 18-6s14 14 18-4 12-8 16 8" stroke="#F2B84B" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M27 56l7 64" stroke="#fff" opacity=".25" stroke-width="5"/><text x="60" y="93" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="11" fill="#C8102E">NOODLES</text>',
  2: '<path d="M24 14c-5 40-5 80 0 114h72c5-34 5-74 0-114z" fill="#FFD329"/><path d="M24 14h72v10H24zM24 118h72v10H24z" fill="#E0A800"/><circle cx="60" cy="72" r="27" fill="#C8102E"/><text x="60" y="77" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="14" fill="#fff">CHIPS</text><ellipse cx="42" cy="44" rx="9" ry="6" fill="#F2A93B" transform="rotate(-20 42 44)"/><ellipse cx="80" cy="102" rx="9" ry="6" fill="#F2A93B" transform="rotate(25 80 102)"/><path d="M33 28l4 86" stroke="#fff" opacity=".4" stroke-width="5"/>',
  3: '<path d="M32 24h56l3 8v94q0 8-8 8H37q-8 0-8-8V32z" fill="#E51B23"/><path d="M29 54q15-12 31 0t31 0v38q-16 12-31 0t-31 0z" fill="#fff"/><path d="M32 22h56l3 8H29z" fill="#C9CED3"/><rect x="29" y="126" width="62" height="9" rx="3" fill="#C9CED3"/><text x="60" y="78" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="15" fill="#C8102E">SODA</text><path d="M38 40v78" stroke="#fff" opacity=".35" stroke-width="5"/>',
  4: '<rect x="48" y="6" width="24" height="15" rx="3" fill="#1E78D6"/><path d="M50 21h20v10c0 8 20 10 20 28v70q0 6-6 6H36q-6 0-6-6V59c0-18 20-20 20-28z" fill="#CFEAFB" stroke="#7FB9E4" stroke-width="2"/><rect x="30" y="74" width="60" height="36" fill="#fff"/><rect x="30" y="74" width="60" height="8" fill="#C8102E"/><text x="60" y="100" text-anchor="middle" font-family="Poppins,sans-serif" font-weight="800" font-size="12" fill="#1E78D6">WATER</text><path d="M38 40v28" stroke="#fff" stroke-width="4" opacity=".8"/>',
  5: '<g transform="rotate(35 60 70)"><rect x="52" y="8" width="16" height="96" rx="6" fill="#C8102E"/><rect x="52" y="74" width="16" height="22" fill="#211D1D"/><rect x="68" y="14" width="4" height="30" rx="2" fill="#FFD329"/><path d="M52 104h16l-6 22h-4z" fill="#E9E9E9"/><path d="M58 126h4l-2 8z" fill="#211D1D"/></g>',
  6: '<rect x="28" y="12" width="68" height="116" rx="7" fill="#C8102E"/><rect x="28" y="12" width="12" height="116" rx="5" fill="#8F0B1F"/><rect x="50" y="40" width="38" height="34" rx="5" fill="#FFD329"/><path d="M55 54h28M55 62h20" stroke="#C8102E" stroke-width="2.5" stroke-linecap="round"/><path d="M30 28h-6M30 48h-6M30 68h-6M30 88h-6M30 108h-6" stroke="#CFCFCF" stroke-width="4" stroke-linecap="round"/>'
};
ART.generic = '<path d="M26 40h68l6 88H20z" fill="#C8102E"/><path d="M40 40a20 20 0 0 1 40 0" fill="none" stroke="#8F0B1F" stroke-width="6"/><circle cx="60" cy="84" r="20" fill="#FFD329"/>';
function getArt(id) {
  const product = products.find(p => p.id === id);
  if (product && product.photo) return '<img src="' + product.photo + '" alt="">';
  return '<svg viewBox="0 0 120 140" aria-hidden="true">' + (ART[id] || ART.generic) + '</svg>';
}

// The cart holds items like: { id, name, price, quantity }
let cart = [];

// Remembers which row changed last, so only that row animates
let lastChanged = null;

// Category chip currently selected on the Home page ("All" shows everything)
let activeCategory = "All";

// true after payment is confirmed, so the finished sale cannot be changed
let transactionLocked = false;

let transactionCount = 0;

// Largest cash amount the cashier can enter (stops absurd values)
const MAX_CASH = 1000000;

/* ---------- 2. PAGE ELEMENTS ---------- */
// We find each HTML element once, using the ids from index.html

// Home page (product list)
const productGrid       = document.getElementById("product-grid");
const searchInput       = document.getElementById("search-input");
const scanForm          = document.getElementById("scan-form");
const scanInput         = document.getElementById("scan-input");
const scanMessage       = document.getElementById("scan-message");
const cameraScanBtn     = document.getElementById("camera-scan-btn");
const stopCameraBtn     = document.getElementById("stop-camera-btn");
const scanReader        = document.getElementById("scan-reader");
const resultsCount      = document.getElementById("results-count");
const categoryFilters   = document.getElementById("category-filters");
const toastRegion       = document.getElementById("toast-region");
const summaryCount      = document.getElementById("summary-count");

// Cart page
const cartTable         = document.getElementById("cart-table");
const cartItems         = document.getElementById("cart-items");
const cartTotal         = document.getElementById("cart-total");
const emptyCartMsg      = document.getElementById("empty-cart-message");
const clearCartBtn      = document.getElementById("clear-cart-btn");
const toPaymentBtn      = document.getElementById("to-payment-btn");

// Payment page
const amountDue         = document.getElementById("amount-due");
const cashInput         = document.getElementById("cash-input");
const changeAmount      = document.getElementById("change-amount");
const paymentMessage    = document.getElementById("payment-message");
const confirmBtn        = document.getElementById("confirm-btn");
const backToCartBtn     = document.getElementById("back-to-cart-btn");

// Receipt page: payment confirmation
const confirmation      = document.getElementById("confirmation");
const confirmRef        = document.getElementById("confirm-ref");
const confirmTotal      = document.getElementById("confirm-total");
const confirmPaid       = document.getElementById("confirm-paid");
const confirmChange     = document.getElementById("confirm-change");

// Receipt page: digital receipt
const noReceiptMsg      = document.getElementById("no-receipt-message");
const receiptSection    = document.getElementById("receipt-section");
const receiptRef        = document.getElementById("receipt-ref");
const receiptDate       = document.getElementById("receipt-date");
const receiptItems      = document.getElementById("receipt-items");
const receiptTotal      = document.getElementById("receipt-total");
const receiptPaid       = document.getElementById("receipt-paid");
const receiptChange     = document.getElementById("receipt-change");
const newTransactionBtn = document.getElementById("new-transaction-btn");

// Header and sidebar
const clockEl           = document.getElementById("clock");
const cartCount         = document.getElementById("cart-count");
const navLinks          = document.querySelectorAll(".nav-link");
const pages             = document.querySelectorAll(".page");

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
  if (type === "error") {
    cashInput.classList.remove("shake");
    void cashInput.offsetWidth;
    cashInput.classList.add("shake");
  }
}

// Remove the message under the cash input
function clearMessage() {
  paymentMessage.textContent = "";
  paymentMessage.className = "message";
}

// Clear the message and set the change display back to zero
function resetPaymentFeedback() {
  clearMessage();
  cashInput.classList.remove("is-valid");
  changeAmount.textContent = formatMoney(0);
}

// Find a product's row in the cart (undefined if it is not in the cart)
function findCartItem(productId) {
  return cart.find(item => item.id === productId);
}

// Price x quantity for one cart item
function getItemSubtotal(item) {
  return roundMoney(item.price * item.quantity);
}

// Make a reference number like TXN-20261013-0001
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
  const visibleProducts = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search) ||
     String(p.barcode || "").toLowerCase().includes(search)));

  resultsCount.textContent = visibleProducts.length + (visibleProducts.length === 1 ? " product" : " products");

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = '<div class="empty-state"><strong>No products match</strong><p>Try another search word or category.</p>' +
      '<button type="button" class="btn btn-outline" data-action="reset-filters">Show all products</button></div>';
    return;
  }

  const disabled = transactionLocked ? "disabled" : "";
  let html = "";
  visibleProducts.forEach((product, index) => {
    html += `
      <article class="product-card reveal" data-cat="${esc(product.category)}" style="--i:${index}">
        <div class="product-image" aria-hidden="true">${getArt(product.id)}<span class="product-category">${esc(product.category)}</span></div>
        <h3 class="product-name">${esc(product.name)}</h3>
        <p class="product-price">${formatMoney(product.price)}</p>
        <button type="button" class="btn btn-accent" data-id="${product.id}" ${disabled}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span>Add to Cart</span></button>
      </article>`;
  });
  productGrid.innerHTML = html;
  productGrid.querySelectorAll(".reveal").forEach(card => {
    if (revealObserver) revealObserver.observe(card); else card.classList.add("in");
  });
}

// Category chips are built from the real product categories
function renderFilters() {
  const names = ["All"].concat([...new Set(products.map(p => p.category))]);
  categoryFilters.innerHTML = names.map(name => {
    const count = name === "All" ? products.length : products.filter(p => p.category === name).length;
    const label = name === "All" ? "All Products" : name;
    return `<button type="button" class="chip" data-category="${esc(name)}" aria-pressed="${name === activeCategory}">${esc(label)} (${count})</button>`;
  }).join("");
}

function resetFilters() {
  activeCategory = "All";
  searchInput.value = "";
  renderFilters();
  renderProducts();
}

/* ---------- 5. CART (Steps 2 & 3: Add to Cart, Review Order) ---------- */

// Called after every cart change: clear old payment feedback, then redraw the cart
function refreshCart() {
  resetPaymentFeedback();
  renderCart();
}

// Add a product. If it is already in the cart, increase its quantity.
function addToCart(productId) {
  if (transactionLocked) return;

  const existingItem = findCartItem(productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = products.find(p => p.id === productId);
    cart.push({ id: product.id, name: product.name, price: product.price, category: product.category, quantity: 1 });
  }

  lastChanged = { id: productId, type: "added" };
  refreshCart();
}

function addScannedProduct(rawCode) {
  const code = rawCode.trim().toLowerCase();
  if (!code) {
    scanMessage.textContent = "Scan or enter a barcode or QR value first.";
    return;
  }

  const product = products.find(item => String(item.barcode || "").trim().toLowerCase() === code);
  scanInput.value = "";
  if (!product) {
    scanMessage.textContent = "No product is assigned to that code. Add the barcode or QR value to the product under Products.";
    scanInput.focus();
    return;
  }

  if (transactionLocked) {
    scanMessage.textContent = "This sale is complete. Start a new transaction before scanning another product.";
    return;
  }

  addToCart(product.id);
  scanMessage.textContent = product.name + " added to the cart.";
}

let cameraScanner = null;
let cameraScanStarting = false;

async function stopCameraScan() {
  const scanner = cameraScanner;
  cameraScanner = null;
  cameraScanBtn.disabled = true;
  try {
    if (scanner?.isScanning) await scanner.stop();
    if (scanner) scanner.clear();
  } catch (error) {
    console.error("Could not stop the product scanner camera cleanly.", error);
    scanMessage.textContent = "Camera scanning stopped, but the scanner could not fully reset. Reload the page if the camera stays active.";
  } finally {
    scanReader.replaceChildren();
    scanReader.hidden = true;
    stopCameraBtn.hidden = true;
    cameraScanBtn.hidden = false;
    cameraScanBtn.disabled = cameraScanStarting;
  }
}

async function startCameraScan() {
  if (cameraScanStarting || cameraScanner) return;
  if (typeof window.Html5Qrcode !== "function") {
    scanMessage.textContent = "The camera scanner could not load. Check your internet connection, then reload the page.";
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    scanMessage.textContent = "Camera access requires HTTPS or localhost in a browser with camera support. Use a USB scanner or type the code instead.";
    return;
  }

  cameraScanStarting = true;
  cameraScanBtn.disabled = true;
  scanReader.hidden = false;
  scanMessage.textContent = "Starting camera. Allow camera access when your browser asks.";

  try {
    const formats = window.Html5QrcodeSupportedFormats;
    const scanner = new window.Html5Qrcode("scan-reader", {
      verbose: false,
      formatsToSupport: [
        formats.QR_CODE,
        formats.EAN_13,
        formats.EAN_8,
        formats.UPC_A,
        formats.UPC_E,
        formats.CODE_128,
        formats.CODE_39,
        formats.ITF,
        formats.DATA_MATRIX
      ]
    });
    cameraScanner = scanner;
    await scanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (width, height) => ({
          width: Math.floor(Math.min(width * 0.9, 320)),
          height: Math.floor(Math.min(height * 0.6, 180))
        }),
        aspectRatio: 1.777778
      },
      async decodedText => {
        if (cameraScanner !== scanner) return;
        await stopCameraScan();
        addScannedProduct(decodedText);
      },
      () => {}
    );
    if (cameraScanner === scanner) {
      cameraScanBtn.hidden = true;
      stopCameraBtn.hidden = false;
      scanMessage.textContent = "Camera ready. Hold one product barcode or QR code inside the scan box.";
    } else {
      if (scanner.isScanning) await scanner.stop();
      scanner.clear();
    }
  } catch (error) {
    console.error("Could not start the product scanner camera.", error);
    if (cameraScanner) await stopCameraScan();
    else scanReader.hidden = true;
    scanMessage.textContent = error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
      ? "Camera permission was denied. Allow camera access in your browser settings, then try again."
      : error.name === "NotFoundError" || error.name === "NotReadableError"
        ? "No usable camera was found. Check that the camera is connected and not in use by another app."
        : "Could not start the camera. Use a USB scanner or type the code instead.";
  } finally {
    cameraScanStarting = false;
    cameraScanBtn.disabled = false;
  }
}

// Change quantity by +1 or -1. Quantity never goes below 1.
function changeQuantity(productId, step) {
  if (transactionLocked) return;

  const item = findCartItem(productId);
  if (!item) return;

  const newQuantity = item.quantity + step;
  if (newQuantity < 1) return;

  item.quantity = newQuantity;
  lastChanged = { id: productId, type: "qty" };
  refreshCart();
}

// Remove a product completely
function removeFromCart(productId) {
  if (transactionLocked) return;

  cart = cart.filter(item => item.id !== productId);
  refreshCart();
}

// Empty the whole cart (Clear Cart button)
function clearCart() {
  if (transactionLocked) return;
  cart = [];
  refreshCart();
}

// Build the HTML for one row of the cart table
function createCartRowHtml(item) {
  const disabledAttr  = transactionLocked ? "disabled" : "";
  const minusDisabled = (item.quantity === 1 || transactionLocked) ? "disabled" : "";
  const rowClass = (lastChanged && lastChanged.id === item.id && lastChanged.type === "added") ? "row-new" : "";

  return `
      <tr class="${rowClass}" data-id="${item.id}">
        <td data-label="Item"><span class="item-cell"><span class="item-thumb" data-cat="${esc(item.category)}" aria-hidden="true">${getArt(item.id)}</span><span><b>${esc(item.name)}</b><small class="unit">${formatMoney(item.price)} each</small></span></span></td>
        <td>${formatMoney(item.price)}</td>
        <td>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}"
                    aria-label="Decrease quantity of ${esc(item.name)}" ${minusDisabled}>&minus;</button>
            <span class="qty-value${(lastChanged && lastChanged.id === item.id && lastChanged.type === "qty") ? " pop" : ""}">${item.quantity}</span>
            <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}"
                    aria-label="Increase quantity of ${esc(item.name)}" ${disabledAttr}>+</button>
          </div>
        </td>
        <td>${formatMoney(getItemSubtotal(item))}</td>
        <td>
          <button type="button" class="remove-btn" data-action="remove" data-id="${item.id}"
                  aria-label="Remove ${esc(item.name)} from cart" ${disabledAttr}>Remove</button>
        </td>
      </tr>`;
}

// Redraw the cart table, totals, sidebar badge and Proceed button
function renderCart() {
  const total = getCartTotal();
  const cartIsEmpty = (cart.length === 0);

  emptyCartMsg.hidden = !cartIsEmpty;
  cartTable.hidden = cartIsEmpty;

  let html = "";
  for (const item of cart) {
    html += createCartRowHtml(item);
  }
  cartItems.innerHTML = html;

  const totalChanged = cartTotal.textContent !== formatMoney(total);
  cartTotal.textContent = formatMoney(total);
  amountDue.textContent = formatMoney(total);
  if (totalChanged) pulse(cartTotal);

  // Cart badge in the sidebar and the Proceed to Payment button
  let count = 0;
  for (const item of cart) count += item.quantity;
  if (String(count) !== cartCount.textContent) pulse(cartCount, "bump");
  cartCount.textContent = count;
  cartCount.hidden = (count === 0);
  summaryCount.textContent = count;
  toPaymentBtn.disabled = cartIsEmpty;
  clearCartBtn.disabled = cartIsEmpty || transactionLocked;
  lastChanged = null;
}

function generateReference() {
  const now = new Date();
  const date = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return "TXN-" + date + "-" + String(transactionCount).padStart(4, "0");
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

  if (amount > MAX_CASH) {
    return { valid: false, message: "Cash received is too large. Please enter an amount up to " + formatMoney(MAX_CASH) + "." };
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
async function confirmPayment() {
  if (transactionLocked) return;

  const total = getCartTotal();
  const validation = validateCash(cashInput.value, total);

  // Step 5: if invalid, show the error and stop
  if (!validation.valid) {
    showMessage(validation.message, "error");
    changeAmount.textContent = formatMoney(0);
    return;
  }

  // Step 5: Change = Amount Paid - Total Amount
  const change = roundMoney(validation.amount - total);
  transactionCount += 1;
  const transaction = {
    reference: generateReference(),
    date: new Date().toLocaleString("en-PH"),
    items: cart.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      subtotal: getItemSubtotal(item)
    })),
    total: total,
    paid: validation.amount,
    change: change
  };

  // Lock the sale, then show the confirmation and receipt
  setCheckoutLocked(true);
  renderCart();
  resetPaymentFeedback();
  changeAmount.textContent = formatMoney(change);

  showConfirmation(transaction);
  showReceipt(transaction);
  showToast("Payment confirmed. Receipt ready.");
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
        <td>${esc(item.name)}</td>
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
  noReceiptMsg.hidden = true;
  showPage("receipt");
}

/* ---------- 8. NEW TRANSACTION ---------- */

function startNewTransaction() {
  cart = [];                       // clear cart and quantities
  cashInput.value = "";            // clear payment input
  confirmation.hidden = true;      // hide payment confirmation
  receiptSection.hidden = true;    // hide previous receipt
  noReceiptMsg.hidden = false;
  receiptItems.innerHTML = "";
  receiptRef.textContent = "";
  receiptDate.textContent = "";
  receiptTotal.textContent = "";
  receiptPaid.textContent = "";
  receiptChange.textContent = "";
  confirmRef.textContent = "";
  confirmTotal.textContent = "";
  confirmPaid.textContent = "";
  confirmChange.textContent = "";

  setCheckoutLocked(false);        // let the cashier use the controls again
  resetPaymentFeedback();
  renderCart();
  searchInput.value = "";
  activeCategory = "All";
  renderFilters();
  renderProducts();
  showPage("home");
  showToast("Ready for the next customer.");
}

/* ---------- 9. NAVIGATION AND HEADER ---------- */

// Show one page (home, cart, payment or receipt) and hide the others
function showPage(name) {
  if (name !== "home") stopCameraScan();
  for (const page of pages) {
    page.hidden = (page.id !== "page-" + name);
  }
  for (const link of navLinks) {
    link.classList.toggle("active", link.dataset.page === name);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Show the current date and time in the header
function updateClock() {
  clockEl.textContent = new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "medium" });
}

/* ---------- 10. EVENT LISTENERS ---------- */

// One listener on the product grid handles every "Add to Cart" button
productGrid.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "reset-filters") { resetFilters(); return; }
  if (!button.dataset.id) return;
  addToCart(Number(button.dataset.id));
  flashAdded(button, Number(button.dataset.id));
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
  clearMessage();
});

newTransactionBtn.addEventListener("click", startNewTransaction);
clearCartBtn.addEventListener("click", clearCart);

// Search box filters the product cards as you type
searchInput.addEventListener("input", function () {
  renderProducts(searchInput.value);
});

scanForm.addEventListener("submit", function (event) {
  event.preventDefault();
  addScannedProduct(scanInput.value);
});
cameraScanBtn.addEventListener("click", startCameraScan);
stopCameraBtn.addEventListener("click", function () {
  stopCameraScan();
  scanMessage.textContent = "Camera scanner stopped.";
});

// Sidebar links switch pages
for (const link of navLinks) {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    showPage(link.dataset.page);
  });
}

toPaymentBtn.addEventListener("click", function () { showPage("payment"); });
backToCartBtn.addEventListener("click", function () { showPage("cart"); });

/* ---------- 10b. DESIGN FEATURES (filters, toasts, animation, print) ---------- */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Cards fade in as they scroll into view
const revealObserver = ("IntersectionObserver" in window && !reduceMotion)
  ? new IntersectionObserver(function (entries) {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add("in"); revealObserver.unobserve(entry.target); }
      }
    }, { threshold: 0.15 })
  : null;

// Re-run a CSS animation class on an element
function pulse(element, className = "pop") {
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function showToast(text) {
  while (toastRegion.children.length >= 3) toastRegion.firstChild.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  toastRegion.appendChild(toast);
  setTimeout(() => toast.classList.add("out"), 2200);
  setTimeout(() => toast.remove(), 2600);
}

// Small "Added" confirmation on the button and a toast
function flashAdded(button, productId) {
  const product = products.find(p => p.id === productId);
  const label = button.querySelector("span");
  button.classList.add("added");
  label.textContent = "Added";
  clearTimeout(button.flashTimer);
  button.flashTimer = setTimeout(() => { button.classList.remove("added"); label.textContent = "Add to Cart"; }, 900);
  showToast(product.name + " added to cart");
}

categoryFilters.addEventListener("click", function (event) {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  activeCategory = chip.dataset.category;
  renderFilters();
  renderProducts(searchInput.value);
});

// 3D tilt on product cards (mouse only)
productGrid.addEventListener("pointermove", function (event) {
  const card = event.target.closest(".product-card");
  if (!card || event.pointerType !== "mouse" || reduceMotion) return;
  const box = card.getBoundingClientRect();
  card.style.setProperty("--ry", ((event.clientX - box.left) / box.width - 0.5) * 10 + "deg");
  card.style.setProperty("--rx", (0.5 - (event.clientY - box.top) / box.height) * 8 + "deg");
});
productGrid.addEventListener("pointerout", function (event) {
  const card = event.target.closest(".product-card");
  if (card && !card.contains(event.relatedTarget)) {
    card.style.removeProperty("--rx");
    card.style.removeProperty("--ry");
  }
});

// Hero: artwork, price sticker, parallax tilt, scroll button
function renderHeroArt() {
  for (const slot of document.querySelectorAll("[data-art]")) slot.innerHTML = getArt(Number(slot.dataset.art));
  document.getElementById("hero-min-price").textContent = formatMoney(Math.min(...products.map(p => p.price)));
}
const heroEl = document.querySelector(".hero");
heroEl.addEventListener("pointermove", function (event) {
  if (reduceMotion || event.pointerType !== "mouse") return;
  const box = heroEl.getBoundingClientRect();
  const scene = heroEl.querySelector(".hero-scene");
  scene.style.setProperty("--ry", ((event.clientX - box.left) / box.width - 0.5) * 16 + "deg");
  scene.style.setProperty("--rx", (0.5 - (event.clientY - box.top) / box.height) * 10 + "deg");
});
document.getElementById("explore-btn").addEventListener("click", function () {
  document.getElementById("products").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});
setTimeout(() => heroEl.classList.remove("intro"), 2500);

document.getElementById("empty-cart-btn").addEventListener("click", function () { showPage("home"); });
document.getElementById("print-btn").addEventListener("click", function () { window.print(); });

// Live change preview: shows change only while the typed amount is valid
cashInput.addEventListener("input", function () {
  const total = getCartTotal();
  const check = validateCash(cashInput.value, total);
  cashInput.classList.toggle("is-valid", check.valid);
  changeAmount.textContent = formatMoney(check.valid ? roundMoney(check.amount - total) : 0);
});

/* ---------- 10c. PRODUCT MANAGEMENT ---------- */

const productForm  = document.getElementById("product-form");
const newName      = document.getElementById("new-name");
const newPrice     = document.getElementById("new-price");
const newCategory  = document.getElementById("new-category");
const newPhoto     = document.getElementById("new-photo");
const photoPreview = document.getElementById("photo-preview");
const productMsg   = document.getElementById("product-message");
const manageList   = document.getElementById("manage-list");
const catalogSearch = document.getElementById("catalog-search");
const catalogCount = document.getElementById("catalog-count");
const categoryList = document.getElementById("category-list");
const photoReplace = document.getElementById("photo-replace");
let pendingPhoto = "";
let replaceId = null;

// Make user-typed text safe to place inside innerHTML
function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const STORAGE_KEY = "campusStoreProducts";

function saveProducts() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (error) {
    console.error("Could not save products to browser storage.", error);
    showToast("Could not save products. Browser storage may be full.");
    return false;
  }
}

function loadProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved product catalog is not a list.");
    const valid = parsed.filter(product => product && typeof product.id === "number" &&
      typeof product.name === "string" && typeof product.price === "number" &&
      typeof product.category === "string");
    if (valid.length) products.splice(0, products.length, ...valid);
  } catch (error) {
    console.error("Could not read saved products from browser storage.", error);
    showToast("Saved product data could not be loaded. Showing the default catalog.");
  }
}

// Resize a chosen photo to a 400x400 square JPEG so it stays small
function readPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Please choose an image file (JPG, PNG or WebP)."));
    if (file.size > 8 * 1024 * 1024) return reject(new Error("That photo is over 8 MB. Choose a smaller one."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("The photo could not be read."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file is not a readable image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 400;
        const ctx = canvas.getContext("2d");
        const side = Math.min(img.width, img.height);
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 400, 400);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showProductMessage(text, type) {
  productMsg.textContent = text;
  productMsg.className = "message " + (text ? type : "");
}

function renderManageList() {
  const query = catalogSearch.value.trim().toLowerCase();
  const visibleProducts = products.filter(p =>
    [p.name, p.category, String(p.barcode || "")].some(value => value.toLowerCase().includes(query))
  );
  catalogCount.textContent = `${visibleProducts.length} of ${products.length} products`;
  categoryList.innerHTML = [...new Set(products.map(p => p.category))].map(c => `<option value="${esc(c)}">`).join("");
  if (products.length === 0) {
    manageList.innerHTML = '<li class="catalog-empty">No products yet. Add a product using the form.</li>';
    return;
  }
  if (visibleProducts.length === 0) {
    manageList.innerHTML = '<li class="catalog-empty">No products match your search.</li>';
    return;
  }
  manageList.innerHTML = visibleProducts.map(p => `
    <li class="manage-item">
      <span class="item-thumb" data-cat="${esc(p.category)}" aria-hidden="true">${getArt(p.id)}</span>
      <span class="manage-info"><b>${esc(p.name)}</b><small>${esc(p.category)} - ${formatMoney(p.price)}</small></span>
      <div class="barcode-editor">
        <label for="product-barcode-${p.id}">Barcode / QR value</label>
        <input class="field" type="text" id="product-barcode-${p.id}" value="${esc(p.barcode || "")}" maxlength="2048" autocomplete="off">
        <button type="button" class="btn btn-outline btn-small" data-action="save-barcode" data-id="${p.id}">Save code</button>
      </div>
      <div class="manage-actions">
        <button type="button" class="btn btn-outline btn-small" data-action="photo" data-id="${p.id}">${p.photo ? "Change photo" : "Add photo"}</button>
        ${p.custom ? `<button type="button" class="remove-btn" data-action="delete" data-id="${p.id}" aria-label="Delete ${esc(p.name)}">Delete</button>` : ""}
      </div>
    </li>`).join("");
}

// Redraw everything that shows the product catalog
function refreshCatalog() {
  if (activeCategory !== "All" && !products.some(p => p.category === activeCategory)) activeCategory = "All";
  renderFilters();
  renderProducts(searchInput.value);
  renderManageList();
  renderCart();
  renderHeroArt();
}

catalogSearch.addEventListener("input", renderManageList);

newPhoto.addEventListener("change", async function () {
  pendingPhoto = "";
  photoPreview.textContent = "No photo selected";
  if (!newPhoto.files[0]) return;
  try {
    pendingPhoto = await readPhoto(newPhoto.files[0]);
    photoPreview.innerHTML = '<img src="' + pendingPhoto + '" alt="Preview of the selected photo">';
    showProductMessage("", "");
  } catch (error) {
    newPhoto.value = "";
    showProductMessage(error.message, "error");
  }
});

productForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const name = newName.value.trim();
  const priceText = newPrice.value.trim();
  const typed = newCategory.value.trim();
  const barcode = document.getElementById("new-barcode").value.trim();
  const fail = message => showProductMessage(message, "error");

  if (!name) return fail("Enter a product name.");
  if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) return fail("A product with that name already exists.");
  if (!/^(\d+\.?\d{0,2}|\.\d{1,2})$/.test(priceText) || Number(priceText) <= 0 || Number(priceText) > 100000) {
    return fail("Enter a price above 0 with at most two decimals, for example 15 or 15.50.");
  }
  if (!typed) return fail("Enter or choose a category.");
  if (barcode && products.some(p => String(p.barcode || "").trim().toLowerCase() === barcode.toLowerCase())) {
    return fail("That barcode or QR value is already assigned to another product.");
  }

  const existing = products.find(p => p.category.toLowerCase() === typed.toLowerCase());
  const id = Math.max(0, ...products.map(p => p.id)) + 1;
  const product = { id: id, name: name, price: roundMoney(Number(priceText)), category: existing ? existing.category : typed, barcode: barcode, photo: pendingPhoto, custom: true };
  const submitButton = productForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  products.push(product);
  if (!saveProducts()) {
    products.pop();
    fail("Could not save the product. Try removing its photo or freeing browser storage.");
    submitButton.disabled = false;
    return;
  }

  productForm.reset();
  pendingPhoto = "";
  photoPreview.textContent = "No photo selected";
  showProductMessage("", "");
  refreshCatalog();
  showToast(name + " added to the store");
  submitButton.disabled = false;
});

manageList.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  if (button.dataset.action === "photo") { replaceId = id; photoReplace.click(); }
  if (button.dataset.action === "save-barcode") {
    const product = products.find(p => p.id === id);
    const input = document.getElementById("product-barcode-" + id);
    if (!product || !input) return;
    const barcode = input.value.trim();
    if (barcode && products.some(p => p.id !== id && String(p.barcode || "").trim().toLowerCase() === barcode.toLowerCase())) {
      showToast("That barcode or QR value is already assigned to another product.");
      return;
    }

    const previousBarcode = product.barcode || "";
    product.barcode = barcode;
    if (!saveProducts()) {
      product.barcode = previousBarcode;
      input.value = previousBarcode;
      showToast("Could not save the code. Try again after freeing browser storage.");
      return;
    }
    renderManageList();
    showToast(barcode ? "Scan code saved for " + product.name : "Scan code removed from " + product.name);
    return;
  }
  if (button.dataset.action === "delete") {
    const product = products.find(p => p.id === id);
    if (findCartItem(id)) { showToast("Remove " + product.name + " from the cart first."); return; }
    if (!window.confirm("Delete " + product.name + " from the store?")) return;
    const productIndex = products.indexOf(product);
    products.splice(productIndex, 1);
    if (!saveProducts()) {
      products.splice(productIndex, 0, product);
      return;
    }
    refreshCatalog();
    showToast(product.name + " deleted");
  }
});

photoReplace.addEventListener("change", async function () {
  const product = products.find(p => p.id === replaceId);
  const file = photoReplace.files[0];
  photoReplace.value = "";
  if (!product || !file) return;
  try {
    const previousPhoto = product.photo;
    product.photo = await readPhoto(file);
    if (!saveProducts()) {
      product.photo = previousPhoto;
      showToast("Could not save the photo. Try a smaller image or free browser storage.");
      return;
    }
    refreshCatalog();
    showToast("Photo updated for " + product.name);
  } catch (error) {
    showToast(error.message);
  }
});

/* ---------- 11. START THE APP ---------- */
loadProducts();
renderHeroArt();
renderFilters();
renderProducts();
renderManageList();
renderCart();
resetPaymentFeedback();
updateClock();
setInterval(updateClock, 1000);