# ResellBay GeekHaven Task 2

## Overview

ResellBay is a full-stack web application designed for buying and selling products, featuring user authentication, product listings, cart management, order processing, reviews, chat functionality, and more. This repository contains both the frontend (Next.js + Tailwind CSS) and backend (Node.js + Express + MongoDB) codebases.

---

## Table of Contents

- [Project Structure](#project-structure)
- [Frontend](#frontend)
  - [Features](#frontend-features)
  - [Setup & Development](#frontend-setup--development)
  - [Deployment](#frontend-deployment)
- [Backend](#backend)
  - [Features](#backend-features)
  - [Setup & Development](#backend-setup--development)
  - [API Endpoints](#backend-api-endpoints)
  - [Deployment](#backend-deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Project Structure

```
resellbay-task2-geekhaven/
├── backend/      # Node.js Express API
├── frontend/     # Next.js client app
└── README.md     # Project documentation
```

---

## Frontend

### Features

- Built with **Next.js** and **Tailwind CSS**
- Modern UI/UX with responsive design
- Authentication (login/register)
- Product listing, filtering, and pagination
- Add/Edit/Delete products (for sellers)
- Cart management
- Checkout and order history
- Review system for products
- Seller profiles and listings
- Real-time chat between buyers and sellers
- Toast notifications and theme support

### Setup & Development

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The app runs at `http://localhost:3000` by default.

### Deployment

- **Live Frontend Link:** [https://resellbay-task2-geekhaven.vercel.app/]
- Deployed on Vercel (see `next.config.mjs` for custom config)

---

## Backend

### Features

- Built with **Node.js**, **Express**, and **MongoDB**
- RESTful API endpoints
- JWT-based authentication & authorization
- Product, cart, order, review, and user management
- Real-time chat via Socket.io
- Rate limiting, request logging, and error handling middleware
- Email notifications (order, verification, etc.)
- Swagger API documentation

### Setup & Development

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (see [Environment Variables](#environment-variables))
4. Start the server:
   ```bash
   npm start
   ```
5. The API runs at `http://localhost:5000` by default.

### API Endpoints

- **Auth:** `/api/auth` (register, login, verify email, etc.)
- **Products:** `/api/products` (CRUD, search, filter)
- **Cart:** `/api/cart` (add/remove/view items)
- **Orders:** `/api/orders` (place/view orders)
- **Reviews:** `/api/reviews` (add/view reviews)
- **Users:** `/api/users` (profile, listings)
- **Chat:** `/api/chat` (messages, conversations)
- **Checkout:** `/api/checkout` (payment, summary)
- **Swagger Docs:** `/api/docs`
- **Logs:** `/logs`

### Deployment

- **Live Backend Link:** [https://resellbay-geekhaven-backend.onrender.com](https://resellbay-geekhaven-backend.onrender.com)
- Deployed on Render (see `config/db.js` for DB config)

---

## Environment Variables

Both frontend and backend require `.env` files for sensitive configuration. Example variables:

### Backend `.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

### Frontend `.env`

```
NEXT_PUBLIC_API_URL=https://resellbay-geekhaven-backend.onrender.com
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact & Support

For any queries or support, please open an issue or contact the maintainers.

---

## Credits

Developed for GeekHaven ResellBay Task 2.
