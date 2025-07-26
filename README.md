# Full-Stack Store Rating Application

A modern web application built with React (Frontend) and Node.js/Express (Backend) that allows users to submit ratings for stores. Features role-based access control with three user types: System Administrator, Normal User, and Store Owner.

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, Sequelize ORM
- **Database:** PostgreSQL (Neon Cloud)
- **Authentication:** JWT tokens
- **State Management:** React Context + Hooks

## 📋 Features

### System Administrator
- Add new stores, users, and admin users
- Dashboard with total users, stores, and ratings statistics
- View and manage all users and stores
- Apply filters and sorting on all listings

### Normal User
- Register and login to the platform
- Browse and search stores
- Submit and modify ratings (1-5 stars)
- Update password

### Store Owner
- Login and manage store information
- View customer ratings and feedback
- Dashboard with store performance metrics

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Neon Cloud recommended)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with your database configuration
# Copy the example below and update with your values:

# DATABASE_URL=your_neon_postgres_connection_string
# JWT_SECRET=your-super-secret-jwt-key
# PORT=5000
# NODE_ENV=development

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file with API configuration
# Copy the example below:

# VITE_API_BASE_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

### 4. Database Setup
The application will automatically create tables when you first start the backend server. A default admin user will be created with:
- Email: `admin@storerating.com`
- Password: `Admin123!`

## 🌐 Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 📁 Project Structure

```
project/
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React Context providers
│   │   ├── services/   # API service functions
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/            # Node.js/Express API
│   ├── controllers/    # Route controllers
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration files
│   └── ...
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 🎨 Features

- **Dark/Light Mode:** Toggle between themes
- **Responsive Design:** Works on desktop and mobile
- **Real-time Validation:** Form validation with clear error messages
- **Sorting & Filtering:** Advanced table features
- **Animated Transitions:** Smooth page transitions and micro-interactions
- **Role-based UI:** Different interfaces for each user role

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `PUT /api/auth/update-password` - Update password

### Users (Admin only)
- `GET /api/users` - Get all users with filtering/sorting
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID

### Stores
- `GET /api/stores` - Get all stores with filtering/sorting
- `POST /api/stores` - Create new store (Admin only)
- `GET /api/stores/:id` - Get store by ID

### Ratings
- `POST /api/ratings` - Submit/update rating (Users only)
- `GET /api/ratings/store/:storeId` - Get store ratings

### Dashboard
- `GET /api/dashboard/admin` - Admin dashboard stats
- `GET /api/dashboard/store-owner` - Store owner dashboard

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder

### Backend (Render/Fly.io)
1. Set environment variables
2. Deploy with Node.js runtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please create an issue in the repository. 
