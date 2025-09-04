# Game Store Website System

A comprehensive e-commerce platform for gaming products, built with modern web technologies and secure payment integration.

## 🎮 Demo

**Live Demo**: [https://lugx-gaming-client.vercel.app](https://lugx-gaming-client.vercel.app)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## 📖 Overview

LUGX Gaming is a full-stack e-commerce platform designed specifically for gaming enthusiasts. The platform provides a seamless shopping experience with secure authentication, product management, and optimized performance for handling gaming product catalogs.

## ✨ Features

- 🛒 **Product Catalog** - Browse and search gaming products
- 🔐 **User Authentication** - Secure login and registration system
- 🛍️ **Shopping Cart** - Add, remove, and manage cart items
- 💳 **Order Management** - Track orders and purchase history
- 👤 **User Profiles** - Manage personal information and preferences
- 📱 **Responsive Design** - Optimized for desktop and mobile devices
- ⚡ **Performance Optimized** - Fast loading with efficient data management
- 🔍 **Advanced Search** - Filter products by category, price, and ratings
- 📊 **Admin Panel** - Product and user management for administrators

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **NestJS** - Progressive Node.js framework for scalable applications
- **PostgreSQL** - Robust relational database management system
- **JWT** - JSON Web Tokens for secure authentication
- **bcrypt** - Password hashing for security

### Frontend
- **Next.js** - React framework with SSR capabilities
- **React** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API requests

## 🔧 Installation

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/GiangTechiee/LugxGamingServer.git
cd LugxGamingServer

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Configure your database connection and JWT secret

# Database setup
npm run migration:run
npm run seed:run

# Start development server
npm run start:dev
```

### Frontend Setup
```bash
# Clone frontend repository
git clone [https://github.com/GiangTechiee/GameStoreClient.git]
cd lugx-gaming-client

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Set API base URL and other configurations

# Start development server
npm run dev
```

## 🎯 Usage

### For Customers
1. **Browse Products**: Explore gaming products by categories
2. **User Account**: Register or login to access full features
3. **Shopping**: Add products to cart and proceed to checkout
4. **Order Tracking**: Monitor order status and history

### For Administrators
1. **Product Management**: Add, edit, or remove products
2. **User Management**: View and manage user accounts
3. **Order Management**: Process and track customer orders
4. **Analytics**: View sales reports and platform statistics

## 📚 API Documentation

### Authentication
```
POST /auth/register     - User registration
POST /auth/login        - User login
POST /auth/logout       - User logout
GET  /auth/profile      - Get user profile
PUT  /auth/profile      - Update user profile
```

### Products
```
GET    /products        - Get all products
GET    /products/:id    - Get product by ID
POST   /products        - Create new product (Admin)
PUT    /products/:id    - Update product (Admin)
DELETE /products/:id    - Delete product (Admin)
GET    /products/search - Search products
```

### Orders
```
GET    /orders          - Get user orders
POST   /orders          - Create new order
GET    /orders/:id      - Get order details
PUT    /orders/:id      - Update order status
```

### Categories
```
GET    /categories      - Get all categories
POST   /categories      - Create category (Admin)
PUT    /categories/:id  - Update category (Admin)
DELETE /categories/:id  - Delete category (Admin)
```

## 📁 Project Structure

```
lugx-gaming-server/
├── src/
│   ├── auth/           # Authentication module
│   ├── products/       # Product management
│   ├── orders/         # Order processing
│   ├── users/          # User management
│   ├── categories/     # Product categories
│   ├── common/         # Shared utilities
│   ├── database/       # Database configuration
│   └── main.ts         # Application entry point
├── migrations/         # Database migrations
├── seeds/              # Database seeders
├── test/               # Test files
├── uploads/            # File uploads
└── README.md
```

## 📸 Screenshots

### Homepage
![Homepage](screenshots/homepage.png)

### Product Catalog
![Products](screenshots/products.png)

### Shopping Cart
![Cart](screenshots/cart.png)


### Manual Deployment
```bash
# Build production
npm run build

# Start production server
npm run start:prod
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Trần Trường Giang**
- Email: giangtt8726@gmail.com
- GitHub: [@GiangTechiee](https://github.com/GiangTechiee)
- LinkedIn: [Trần Trường Giang](https://linkedin.com/in/tran-truong-giang)

## 🙏 Acknowledgments

- Thanks to the NestJS team for the amazing framework
- Tailwind CSS for the utility-first approach
- PostgreSQL for reliable data management

---

⭐ If you found this project helpful, please give it a star!
