# 🏢 Employee Management System

A comprehensive **Employee Management System** that combines **Leave Management** and **Payroll Management** into a single, powerful HR solution.

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-role system**: Employee, Manager, Admin
- **JWT-based authentication**
- **Role-based access control**
- **Secure password handling**

### 📅 Leave Management
- **Leave request submission** with validation
- **Leave approval workflow** (Manager/Admin)
- **Leave balance tracking** with automatic deduction
- **Multiple leave types**: Annual, Sick, Personal, Maternity, Paternity
- **Leave history** and status tracking
- **Single-day leave support**
- **Email notifications** for leave status changes

### 💰 Payroll Management
- **Automated payroll generation** with leave integration
- **Salary structure management** (Basic, HRA, DA, TA, PF, Tax)
- **Leave deduction calculation** from salary
- **Payroll history** and detailed breakdown
- **Currency formatting** (INR)
- **Print-ready payslips**
- **Payroll statistics** and analytics

### 👥 Employee Management
- **Employee profiles** with complete information
- **Department management**
- **Manager assignment** and team structure
- **Salary configuration** per employee
- **Bank details** and payroll information

### 📊 Dashboard & Analytics
- **Real-time statistics** for leaves and payroll
- **Leave balance visualization**
- **Payroll overview** for managers/admins
- **Quick action buttons**
- **Notification system**

### 🔔 Notifications
- **In-app notifications** with real-time updates
- **Email notifications** for leave requests and approvals
- **Toast notifications** for user feedback
- **Notification bell** with unread count

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **JWT** for authentication
- **Nodemailer** for email notifications
- **In-memory data store** (demo mode)
- **CORS** enabled for frontend integration

### Frontend
- **React 18** with functional components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Heroicons** for icons
- **React Hot Toast** for notifications
- **Date-fns** for date manipulation

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Leave-Management
```

2. **Install dependencies**
```bash
npm install
cd client && npm install
cd ..
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=5000
JWT_SECRET=your-secret-key
```

4. **Start the application**
```bash
# Start backend server
npm run backend

# In another terminal, start frontend
npm start
```

5. **Access the application**
- Frontend: http://localhost:3001
- Backend API: http://localhost:5000

## 👤 Demo Users

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Admin | admin@company.com | password123 | Full access |
| Manager | manager@company.com | password123 | Team management + Payroll |
| Employee | employee@company.com | password123 | Leave requests only |

## 📋 User Roles & Permissions

### 👨‍💼 Admin
- **Full system access**
- **User management** (create, edit, delete)
- **Department management**
- **Leave type configuration**
- **Payroll generation** for all employees
- **System statistics**

### 👨‍💻 Manager
- **Team management** (view team members)
- **Leave approval** for team members
- **Payroll generation** for team members
- **Team statistics**

### 👷 Employee
- **Leave request submission**
- **View own leave history**
- **View own payroll** (if generated)
- **Profile management**

## 💼 Payroll Features

### Salary Components
- **Basic Salary**: Base compensation
- **HRA**: House Rent Allowance (40% of basic)
- **DA**: Dearness Allowance (30% of basic)
- **TA**: Transport Allowance (10% of basic)
- **PF**: Provident Fund (12% deduction)
- **Tax**: Income Tax (10% deduction)

### Payroll Calculation
1. **Gross Salary** = Basic + HRA + DA + TA
2. **Net Salary** = Gross - PF - Tax
3. **Leave Deduction** = (Leave Days × Per Day Salary)
4. **Final Salary** = Net Salary - Leave Deduction

### Payroll Generation
- **Monthly payroll** generation
- **Leave integration** (automatic deduction)
- **Working days** calculation
- **Detailed breakdown** with earnings and deductions

## 📧 Email Notifications

### Email Templates
- **Leave Request**: Manager notification when employee submits
- **Leave Approved**: Employee notification when approved
- **Leave Rejected**: Employee notification with reason

### Email Setup
1. **Enable 2FA** on your Gmail account
2. **Generate App Password** for mail access
3. **Update .env** with email credentials
4. **Test email** functionality

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Leave Management
- `GET /api/leaves` - Get leave requests
- `POST /api/leaves` - Submit leave request
- `PUT /api/leaves/:id/approve` - Approve/reject leave
- `GET /api/leaves/stats` - Leave statistics

### Payroll Management
- `GET /api/payroll` - Get payroll history
- `POST /api/payroll/generate` - Generate payroll
- `GET /api/payroll/:id` - Get payroll details
- `GET /api/payroll/stats` - Payroll statistics

### User Management
- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `PUT /api/users/:id/salary` - Update salary

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## 📱 Features by Role

### Employee Features
- ✅ Submit leave requests
- ✅ View leave balance
- ✅ Track request status
- ✅ View payroll (if generated)
- ✅ Receive notifications

### Manager Features
- ✅ Approve/reject team leave requests
- ✅ View team statistics
- ✅ Generate payroll for team
- ✅ Manage team members
- ✅ Receive leave notifications

### Admin Features
- ✅ Full user management
- ✅ Department management
- ✅ Leave type configuration
- ✅ Generate payroll for all employees
- ✅ System-wide statistics
- ✅ Email configuration

## 🎨 UI/UX Features

### Modern Design
- **Responsive layout** (mobile-friendly)
- **Clean, professional** interface
- **Intuitive navigation**
- **Consistent styling** with Tailwind CSS

### User Experience
- **Real-time updates** with React Query
- **Loading states** and error handling
- **Toast notifications** for feedback
- **Form validation** and error messages
- **Confirmation dialogs** for important actions

### Accessibility
- **Keyboard navigation** support
- **Screen reader** friendly
- **High contrast** color scheme
- **Responsive design** for all devices

## 🔒 Security Features

### Authentication
- **JWT tokens** for session management
- **Password hashing** with bcrypt
- **Role-based access** control
- **Secure API endpoints**

### Data Protection
- **Input validation** on all forms
- **SQL injection** prevention
- **XSS protection**
- **CORS configuration**

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Data Store    │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (In-Memory)   │
│                 │    │                 │    │                 │
│ • User Interface│    │ • API Routes    │    │ • Users         │
│ • State Mgmt    │    │ • Auth Middleware│   │ • Leaves        │
│ • Routing       │    │ • Business Logic│   │ • Payrolls      │
│ • Components    │    │ • Email Service │   │ • Notifications │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Deployment

### Production Setup
1. **Environment variables** configuration
2. **Database** setup (MongoDB/PostgreSQL)
3. **Email service** configuration
4. **SSL certificate** setup
5. **Domain** configuration

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- **Email**: support@company.com
- **Documentation**: [Wiki Link]
- **Issues**: [GitHub Issues]

---

**Built with ❤️ using React, Node.js, and Tailwind CSS** 