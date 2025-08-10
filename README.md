# Online Ordering System with Role-Based Access Control (Client/Admin)

In the restaurant industry, managing online orders, tracking inventory, and ensuring secure access for staff and customers can quickly become complex. Many small and medium-sized restaurants struggle to provide a smooth user experience for customers while maintaining efficient back-office management.

This project solves that challenge by providing a **complete online restaurant management system** with a **modern client interface** for browsing and ordering meals, and a **secure admin dashboard** for managing products, categories, and orders. With **role-based access control**, each user gets the right tools for their role — improving security, efficiency, and customer satisfaction.

## Main Features

- **Client Interface**:
  - Responsive design
  - Browse available dishes (with images, categories, etc.)
  - Online ordering system
  - Filter by category
  - Secure registration, login, and password recovery
  - Email verification via OTP
  - Online payment through Stripe gateway

- **Admin Interface (RBAC)**:
  - Responsive design
  - Secure dashboard
  - Manage dishes
  - Manage categories
  - View and manage orders
  - Image upload via Multer
  - Role-based access control (admin/client)

## Tech Stack

- **Frontend**: React.js, CSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB (hosted on MongoDB Atlas)
- **Authentication**:
  - JSON Web Token (JWT)
  - OTP for email verification (registration, password reset)
- **Image Upload**: Multer

## Deployment

- **Frontend (Netlify)**: [https://restaurantw.netlify.app/](https://restaurantw.netlify.app/)
- **Backend (Render)**: [https://restaurant-project-ek2l.onrender.com](https://restaurant-project-ek2l.onrender.com)

## Security & Roles

- Secure authentication with JWT
- Email verification via OTP
- Role management (admin / client)
- Protection of sensitive routes

