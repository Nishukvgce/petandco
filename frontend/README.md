# PET&CO - Frontend

A modern React-based e-commerce frontend application for PET&CO organic products store.

## 🚀 Features

- **React 18** - React version with improved rendering and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework with extensive customization
- **React Router v6** - Declarative routing for React applications
- **Context API** - State management for cart, authentication, and user data
- **Responsive Design** - Mobile-first design with responsive layouts
- **Admin Panel** - Complete admin dashboard for product and order management
- **User Dashboard** - User account management, order history, and preferences
- **Shopping Cart** - Full shopping cart functionality with local storage
- **Product Catalog** - Advanced product filtering, search, and categorization

## 📋 Prerequisites

- Node.js (v14.x or higher)
- npm or yarn

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration:
   ```
   VITE_API_BASE_URL=http://localhost:8081/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Header, Button, Input, etc.)
│   └── ...             # Other shared components
├── pages/              # Page-level components
│   ├── homepage/       # Homepage components
│   ├── product-detail-page/  # Product detail page
│   ├── admin-panel/    # Admin dashboard
│   ├── user-account-dashboard/  # User dashboard
│   └── ...             # Other pages
├── contexts/           # React Context providers
├── services/           # API service functions
├── utils/              # Utility functions
├── styles/             # Global styles and Tailwind config
└── data/               # Static data and mock data
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 Styling

The project uses TailwindCSS for styling with custom configuration for:
- Custom color schemes
- Typography scales
- Component variants
- Responsive breakpoints

## 📱 Pages & Features

### Public Pages
- **Homepage** - Hero section, featured products, categories
- **Product Catalog** - Product grid with filtering and search
- **Product Details** - Detailed product view with reviews and recommendations
- **Shopping Cart** - Cart management and checkout process
- **User Authentication** - Login and registration

### Admin Panel
- **Dashboard** - Overview of orders, products, and analytics
- **Product Management** - Add, edit, delete products
- **Order Management** - Order processing and tracking
- **User Management** - Customer account management

### User Dashboard
- **Account Overview** - Profile and quick actions
- **Order History** - Past orders and tracking
- **Wishlist** - Saved products
- **Address Book** - Delivery addresses
- **Preferences** - Account settings and preferences

## 🔌 API Integration

The frontend integrates with the Spring Boot backend through RESTful APIs:
- Product catalog and management
- User authentication and authorization  
- Shopping cart and checkout
- Order management
- Admin operations

## 🚀 Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider (Netlify, Vercel, etc.)

## 📄 License

This project is licensed under the MIT License.