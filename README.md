# 🛒 Stripe eCommerce Platform

This project is a generic, full-stack eCommerce web application inspired by platforms like Amazon, Lazada, and Shopee. Designed primarily for retail use, it enables authenticated users to seamlessly buy and sell products with integrated **Stripe Payments**.

## 🚀 Features

- **User Authentication:** Secure login and registration via **Supabase Auth**.
- **Product Management:** Browse products with variation selection.
- **Shopping Cart:** Add items to the cart and manage quantities.
- **Order History:** View past purchases from the buyer's perspective.
- **Checkout Process:** Confirm address and payment details during checkout.
- **Payment Integration:** Secure payment processing using **Stripe Elements**.

## 🧰 Tech Stack

- **Frontend:**
  - AnalogJS
  - Angular
  - Tailwind CSS
  - Spartan UI
- **Backend:**
  - Supabase (Auth)
  - tRPC
  - Nitro
  - h3
- **Database:**
  - PostgreSQL
  - Drizzle ORM
- **Payments:**
  - Stripe (Payments API + Elements)
- **Tools:**
  - Vite
- **Deployment:**
  - Vercel

## 🧾 Order Flow

1. **Product Selection:** Users browse products and select variations.
2. **Cart Management:** Add selected items to the shopping cart and review them.
3. **Checkout:** Confirm shipping address and payment details.
4. **Payment Processing:** Payments are securely handled by **Stripe**.
5. **Order Confirmation:** Users receive confirmation of successful or failed transactions.

## 🔐 Security

- **Payment Data:** All sensitive payment information is securely processed by **Stripe**; the application does not handle raw payment data.
- **User Data:** Authentication and session management are managed by **Supabase Auth**.

## 📦 Deployment

The application is deployed on **Vercel**, ensuring scalability and ease of deployment.

---

_Note: This project is a side project and may not yet be optimized for large-scale production use._
