# SOLAIRE — Static Ecommerce Demo

A static, multi-page ecommerce concept built with plain HTML, CSS and vanilla JavaScript. The site demonstrates a warm, editorial coastal-fashion brand (SOLAIRE) across the typical shopping flow.

## Pages

- `index.html` — Home / landing
- `dresses.html` — Category listing (also reused for `new`, `tops`, `bottoms`, `accessories` via query string)
- `product.html` — Product detail (PDP)
- `cart.html` — Cart
- `checkout-shipping.html` — Checkout: shipping
- `checkout-payment.html` — Checkout: payment

## Structure

```
.
├── index.html
├── dresses.html
├── product.html
├── cart.html
├── checkout-shipping.html
├── checkout-payment.html
└── assets
    ├── styles.css
    ├── script.js
    └── img/
```

## Local preview

Just open `index.html` in a browser, or run any static server, e.g.:

```
python3 -m http.server 8000
```

Then visit `http://127.0.0.1:8000/`.
