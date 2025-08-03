# Leave Management System

A comprehensive leave management system built with Node.js, Express, MongoDB, and React. This system provides a complete solution for managing employee leave requests, approvals, and tracking.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Employee, Manager, Admin)
- JWT token-based authentication
- Password hashing with bcrypt

### 📋 Leave Management
- Submit leave requests with multiple types (Annual, Sick, Personal, Maternity, Paternity, Bereavement)
- Leave approval workflow for managers
- Leave balance tracking
- Date overlap validation
- Half-day leave support
- Leave request comments and attachments

### 👥 User Management
- Employee profiles with department assignment
- Manager-employee relationships
- Department management
- Leave balance management
- User role management

### 📊 Dashboard & Analytics
- Real-time leave statistics
- Leave balance overview
- Recent leave requests
- Department-wise analytics
- Approval workflow tracking

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Modern React components
- Real-time notifications
- Intuitive navigation
- Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **nodemailer** - Email notifications

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Recharts** - Data visualization
- **React Hot Toast** - Notifications

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leave-management
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/leave-management
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode (runs both backend and frontend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Leave Management
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `GET /api/leaves/:id` - Get specific leave request
- `PUT /api/leaves/:id` - Update leave request
- `PUT /api/leaves/:id/approve` - Approve/reject leave
- `DELETE /api/leaves/:id` - Cancel leave request
- `POST /api/leaves/:id/comments` - Add comment

### User Management
- `GET /api/users` - Get users (managers/admins)
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/leave-balance` - Update leave balance

### Department Management
- `GET /api/departments` - Get departments
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

## User Roles

### Employee
- Submit leave requests
- View own leave history
- Check leave balance
- Update profile

### Manager
- All employee permissions
- Approve/reject team leave requests
- View team members
- Manage team leave balances

### Admin
- All manager permissions
- Manage departments
- Manage all users
- System-wide analytics
- Department management

## Database Schema

### User
- Personal information (name, email, employee ID)
- Department assignment
- Role and permissions
- Leave balance tracking
- Manager relationship

### Leave
- Employee reference
- Leave type and dates
- Status and approval workflow
- Comments and attachments
- Duration calculation

### Department
- Department information
- Leave policies
- Department head
- Employee count

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

## Roadmap

- [ ] Email notifications
- [ ] Calendar integration
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Multi-language support
- [ ] API documentation
- [ ] Unit tests
- [ ] Integration tests 