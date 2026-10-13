# Campus Convenience Store POS System

## Project Description

The Campus Convenience Store POS System is a web-based cashier application developed for IT 415 — Application Development and Emerging Technologies.

The system is designed for a small campus convenience store that sells snacks, beverages, and school supplies. It allows cashiers to manage customer orders, calculate totals, process cash payments, and generate digital receipts.

The application features a modern red-and-yellow design inspired by real convenience stores.

## Technologies Used

- HTML5 — Application structure
- CSS3 — User interface and styling
- JavaScript — Ordering and payment functionality
- Visual Studio Code — Development environment
- Git and GitHub — Version control

## Available Products

- Instant Noodles — ₱18.00
- Potato Chips — ₱25.00
- Soft Drink (Can) — ₱25.00
- Bottled Water — ₱20.00
- Ballpen (piece) — ₱12.00
- Notebook (piece) — ₱35.00

## System Features

1. Product listing with prices
2. Add to Cart functionality
3. Increase and decrease quantities
4. Remove products from cart
5. Automatic subtotal and total calculation
6. Order summary
7. Cash payment input
8. Payment validation
9. Automatic change calculation
10. Payment confirmation
11. Digital receipt generation
12. New Transaction functionality
13. Product lookup by barcode or QR code
14. Searchable product catalog for managing product photos and scan codes

## How to Run

1. Download the project from GitHub.
2. Open the project folder in Visual Studio Code.
3. Open `index.html` in a web browser, or run it with VS Code Live Server.
4. Select products and add them to the cart.
5. Enter the customer's cash payment.
6. Confirm payment and view the receipt.
7. Click New Transaction to process another order.

## Product Storage

The app opens directly to the cashier home page. Product changes and uploaded product photos are saved in this browser's local storage, so they are not shared across browsers or devices. Transactions are processed in the current browser session and are not uploaded to a database.

## Scanning Products

1. Open **Products** and enter each product's barcode or QR value, then select **Save code**. New products can be assigned a code when they are added.
2. On Home, focus the scan field and scan with a USB barcode scanner; most scanner devices type the code and press Enter automatically. You can also type a code and press Enter or select **Add scanned product**.
3. Select **Scan with camera** and allow camera access. The camera decoder supports QR codes and common retail barcode formats. Camera access requires HTTPS or localhost, a working camera, and an internet connection to load the scanner library. One matching scan adds one item to the cart.

If a code is not assigned to a product, the scan status explains how to assign it under Products. Search also matches saved barcode/QR values.

## Project Information

**Course:** IT 415 — Application Development and Emerging Technologies

**Scenario:** Scenario 5 — Campus Convenience Store POS

**Institution:** Davao del Norte State College

**Project Type:** Midterm Practical Examination