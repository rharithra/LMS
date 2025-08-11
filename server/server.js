const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { sendLeaveApplicationEmail, sendLeaveApprovalEmail, testEmailConfig } = require('./emailService');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'your-secret-key';

// Data persistence functions
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Save data to file
const saveData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${filename}:`, error);
  }
};

// Load data from file
const loadData = (filename, defaultData = []) => {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
  }
  return defaultData;
};

// Save all data
const saveAllData = () => {
  saveData('users', users);
  saveData('leaves', leaves);
  saveData('attendance', attendance);
  saveData('departments', departments);
  saveData('leaveTypes', leaveTypes);
  saveData('shifts', shifts);
  saveData('payrolls', payrolls);
  saveData('goals', goals);
  saveData('notifications', notifications);
};

// Auto-save interval (save every 5 minutes as backup)
setInterval(() => {
  console.log('Auto-saving data...');
  saveAllData();
}, 5 * 60 * 1000);

// Default data for first-time setup
const defaultUsers = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    password: 'password123',
    employeeId: 'EMP001',
    role: 'admin',
    department: 'IT',
    leaveBalance: { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 },
    salary: { 
      basicSalary: 80000, 
      hra: 32000, 
      da: 24000, 
      ta: 8000, 
      pf: 9600, 
      tax: 12000,
      performanceIncentive: 10000,
      specialAllowance: 5000,
      medicalAllowance: 3000,
      conveyanceAllowance: 2000,
      foodAllowance: 1500,
      otherAllowances: 0,
      grossSalary: 154000,
      totalDeductions: 21600,
      netSalary: 132400
    },
    payrollInfo: { bankName: 'HDFC Bank', accountNumber: '1234567890', ifscCode: 'HDFC0001234' }
  },
  {
    id: 2,
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@company.com',
    password: 'password123',
    employeeId: 'EMP002',
    role: 'manager',
    department: 'HR',
    leaveBalance: { annual: 18, sick: 8, personal: 4, maternity: 90, paternity: 15 },
    salary: { 
      basicSalary: 65000, 
      hra: 26000, 
      da: 19500, 
      ta: 6500, 
      pf: 7800, 
      tax: 9750,
      performanceIncentive: 8000,
      specialAllowance: 4000,
      medicalAllowance: 2500,
      conveyanceAllowance: 1800,
      foodAllowance: 1200,
      otherAllowances: 0,
      grossSalary: 125000,
      totalDeductions: 17550,
      netSalary: 107450
    },
    payrollInfo: { bankName: 'HDFC Bank', accountNumber: '1234567891', ifscCode: 'HDFC0001234' }
  },
  {
    id: 3,
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@company.com',
    password: 'password123',
    employeeId: 'EMP003',
    role: 'employee',
    department: 'Engineering',
    manager: 2,
    leaveBalance: { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 },
    salary: { 
      basicSalary: 50000, 
      hra: 20000, 
      da: 15000, 
      ta: 5000, 
      pf: 6000, 
      tax: 8000,
      performanceIncentive: 5000,
      specialAllowance: 3000,
      medicalAllowance: 2000,
      conveyanceAllowance: 1500,
      foodAllowance: 1000,
      otherAllowances: 0,
      grossSalary: 95000,
      totalDeductions: 14000,
      netSalary: 81000
    },
    payrollInfo: { bankName: 'HDFC Bank', accountNumber: '1234567892', ifscCode: 'HDFC0001234' }
  }
];

const defaultLeaves = [
  {
    id: 1,
    employeeId: 3,
    leaveType: 'annual',
    startDate: '2025-08-15',
    endDate: '2025-08-17',
    duration: 3,
    reason: 'Family vacation',
    status: 'pending',
    createdAt: '2025-08-10T10:00:00.000Z',
    employee: {
      id: 3,
      firstName: 'Employee',
      lastName: 'User',
      employeeId: 'EMP003',
      department: 'Engineering'
    }
  },
  {
    id: 2,
    employeeId: 3,
    leaveType: 'sick',
    startDate: '2025-08-05',
    endDate: '2025-08-06',
    duration: 2,
    reason: 'Medical appointment',
    status: 'approved',
    approvedBy: 2,
    approvedAt: '2025-08-04T14:30:00.000Z',
    createdAt: '2025-08-03T09:15:00.000Z',
    employee: {
      id: 3,
      firstName: 'Employee',
      lastName: 'User',
      employeeId: 'EMP003',
      department: 'Engineering'
    }
  },
  {
    id: 3,
    employeeId: 3,
    leaveType: 'personal',
    startDate: '2025-07-20',
    endDate: '2025-07-20',
    duration: 1,
    reason: 'Personal matter',
    status: 'rejected',
    approvedBy: 2,
    approvedAt: '2025-07-18T16:45:00.000Z',
    rejectionReason: 'Insufficient notice period',
    createdAt: '2025-07-17T11:20:00.000Z',
    employee: {
      id: 3,
      firstName: 'Employee',
      lastName: 'User',
      employeeId: 'EMP003',
      department: 'Engineering'
    }
  }
];

const defaultAttendance = [];
const defaultDepartments = [
  { 
    id: 1, 
    name: 'IT', 
    code: 'IT', 
    description: 'Information Technology', 
    managerId: 1, 
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 2, 
    name: 'HR', 
    code: 'HR', 
    description: 'Human Resources', 
    managerId: 2, 
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 3, 
    name: 'Engineering', 
    code: 'ENG', 
    description: 'Software Engineering', 
    managerId: 2, 
    isActive: true,
    employeeCount: 1,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 4, 
    name: 'Finance', 
    code: 'FIN', 
    description: 'Finance and Accounting', 
    managerId: 1, 
    isActive: true,
    employeeCount: 0,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const defaultLeaveTypes = [
  { id: 1, name: 'Annual Leave', code: 'annual', maxDays: 20, carryForward: true, isActive: true },
  { id: 2, name: 'Sick Leave', code: 'sick', maxDays: 10, carryForward: false, isActive: true },
  { id: 3, name: 'Personal Leave', code: 'personal', maxDays: 5, carryForward: false, isActive: true },
  { id: 4, name: 'Maternity Leave', code: 'maternity', maxDays: 90, carryForward: false, isActive: true },
  { id: 5, name: 'Paternity Leave', code: 'paternity', maxDays: 15, carryForward: false, isActive: true }
];

const defaultShifts = [
  { 
    id: 1, 
    name: 'Morning Shift', 
    startTime: '09:00', 
    endTime: '17:00', 
    breakTime: 60,
    totalHours: 7, 
    description: 'Standard morning shift for office workers',
    color: '#3B82F6',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 2, 
    name: 'Evening Shift', 
    startTime: '17:00', 
    endTime: '01:00', 
    breakTime: 60,
    totalHours: 7, 
    description: 'Evening shift for customer support',
    color: '#10B981',
    department: 'HR',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  { 
    id: 3, 
    name: 'Night Shift', 
    startTime: '22:00', 
    endTime: '06:00', 
    breakTime: 60,
    totalHours: 7, 
    description: 'Night shift for operations team',
    color: '#8B5CF6',
    department: 'Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

const defaultPayrolls = [
  {
    id: 1,
    employeeId: 1,
    year: 2025,
    month: 8,
    basicSalary: 80000,
    hra: 32000,
    da: 24000,
    ta: 8000,
    bonus: 10000,
    pf: 9600,
    tax: 12000,
    grossSalary: 154000,
    deductions: 21600,
    netSalary: 132400,
    payDate: '2025-08-30',
    status: 'paid',
    createdAt: '2025-08-01T00:00:00.000Z'
  },
  {
    id: 2,
    employeeId: 2,
    year: 2025,
    month: 8,
    basicSalary: 65000,
    hra: 26000,
    da: 19500,
    ta: 6500,
    bonus: 8000,
    pf: 7800,
    tax: 9750,
    grossSalary: 125000,
    deductions: 17550,
    netSalary: 107450,
    payDate: '2025-08-30',
    status: 'paid',
    createdAt: '2025-08-01T00:00:00.000Z'
  },
  {
    id: 3,
    employeeId: 3,
    year: 2025,
    month: 8,
    basicSalary: 50000,
    hra: 20000,
    da: 15000,
    ta: 5000,
    bonus: 5000,
    pf: 6000,
    tax: 8000,
    grossSalary: 95000,
    deductions: 14000,
    netSalary: 81000,
    payDate: '2025-08-30',
    status: 'paid',
    createdAt: '2025-08-01T00:00:00.000Z'
  }
];

const defaultGoals = [
  {
    id: 1,
    employeeId: 3,
    title: 'Complete React Training',
    description: 'Finish advanced React course and implement learned concepts',
    category: 'Professional Development',
    priority: 'high',
    status: 'in_progress',
    progress: 60,
    targetDate: '2024-12-31',
    setBy: 2,
    createdAt: '2024-01-15T00:00:00.000Z',
    notes: 'Making good progress on Redux modules'
  },
  {
    id: 2,
    employeeId: 3,
    title: 'Improve Customer Satisfaction Score',
    description: 'Increase team customer satisfaction score to 95%',
    category: 'Performance',
    priority: 'medium',
    status: 'pending',
    progress: 25,
    targetDate: '2024-06-30',
    setBy: 2,
    createdAt: '2024-02-01T00:00:00.000Z'
  }
];

// Load data from files or use defaults
let users = loadData('users', defaultUsers);
let leaves = loadData('leaves', defaultLeaves);
let attendance = loadData('attendance', defaultAttendance);
let departments = loadData('departments', defaultDepartments);
let leaveTypes = loadData('leaveTypes', defaultLeaveTypes);
let shifts = loadData('shifts', defaultShifts);
let payrolls = loadData('payrolls', defaultPayrolls);
let goals = loadData('goals', defaultGoals);

// Notifications data structure
let notifications = loadData('notifications', []);

// Store active socket connections by user ID
const userSockets = new Map();

// Notification helper functions
const createNotification = (recipientId, type, message, data = {}) => {
  const notification = {
    id: getNextId(notifications),
    recipientId,
    type,
    message,
    data,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(notification);
  saveData('notifications', notifications);
  return notification;
};

const sendRealTimeNotification = (userId, notification) => {
  const userSocket = userSockets.get(userId);
  if (userSocket) {
    userSocket.emit('notification', notification);
    console.log(`📧 Real-time notification sent to user ${userId}:`, notification.message);
  } else {
    console.log(`📧 User ${userId} not connected, notification stored for later`);
  }
};

const notifyManager = (employeeId, type, message, data = {}) => {
  const employee = findUserById(employeeId);
  if (employee && employee.manager) {
    const notification = createNotification(employee.manager, type, message, data);
    sendRealTimeNotification(employee.manager, notification);
    return notification;
  }
};

const notifyEmployee = (employeeId, type, message, data = {}) => {
  const notification = createNotification(employeeId, type, message, data);
  sendRealTimeNotification(employeeId, notification);
  return notification;
};

// Force save updated default data (in case defaults changed)
console.log('🔄 Initializing data with current defaults...');
saveAllData();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 New socket connection:', socket.id);
  
  // Authenticate socket connection
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = findUserById(decoded.id);
      
      if (user) {
        socket.userId = user.id;
        userSockets.set(user.id, socket);
        console.log(`🔐 Socket authenticated for user ${user.id} (${user.firstName} ${user.lastName})`);
        
        // Send unread notifications to user
        const unreadNotifications = notifications.filter(n => n.recipientId === user.id && !n.read);
        if (unreadNotifications.length > 0) {
          socket.emit('unread-notifications', unreadNotifications);
          console.log(`📬 Sent ${unreadNotifications.length} unread notifications to user ${user.id}`);
        }
        
        socket.emit('authenticated', { userId: user.id, name: `${user.firstName} ${user.lastName}` });
      } else {
        socket.emit('authentication-error', 'Invalid user');
      }
    } catch (error) {
      socket.emit('authentication-error', 'Invalid token');
    }
  });
  
  // Handle notification read status
  socket.on('mark-notification-read', (notificationId) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.recipientId === socket.userId) {
      notification.read = true;
      saveData('notifications', notifications);
      console.log(`✅ Notification ${notificationId} marked as read by user ${socket.userId}`);
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      userSockets.delete(socket.userId);
      console.log(`🔌 Socket disconnected for user ${socket.userId}`);
    }
  });
});

// Helper functions
const findUserByEmail = (email) => users.find(u => u.email === email);
const findUserById = (id) => users.find(u => u.id == id);
const getNextId = (array) => array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3002'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Early test routes (before any auth middleware)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is running'
  });
});

app.get('/api/data-test', (req, res) => {
  res.json({ 
    message: 'Data test endpoint',
    hasPayrolls: typeof payrolls !== 'undefined',
    payrollCount: Array.isArray(payrolls) ? payrolls.length : 'Not available yet',
    timestamp: new Date().toISOString()
  });
});

// Quick payroll stats without auth for testing
app.get('/api/payroll/stats-test', (req, res) => {
  res.json({
    message: 'Payroll stats test endpoint working',
    timestamp: new Date().toISOString(),
    payrollCount: Array.isArray(payrolls) ? payrolls.length : 'payrolls not available',
    currentMonth: new Date().getMonth() + 1,
    currentYear: new Date().getFullYear()
  });
});

// Authentication middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// EARLY PAYROLL STATS ENDPOINT (for testing route registration)
app.get('/api/payroll/stats', auth, (req, res) => {
  try {
    console.log('🎯 EARLY payroll stats endpoint hit!', { userRole: req.user.role, userId: req.user.id });
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    let allPayrolls = payrolls || [];
    let currentMonthPayrolls = allPayrolls.filter(p => p.month === currentMonth && p.year === currentYear);
    
    // Filter based on user role
    if (req.user.role === 'employee') {
      allPayrolls = allPayrolls.filter(p => p.employeeId === req.user.id);
      currentMonthPayrolls = currentMonthPayrolls.filter(p => p.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      allPayrolls = allPayrolls.filter(p => teamMemberIds.includes(p.employeeId));
      currentMonthPayrolls = currentMonthPayrolls.filter(p => teamMemberIds.includes(p.employeeId));
    }
    
    const totalSalaryPaid = allPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const currentMonthSalary = currentMonthPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const averageSalary = allPayrolls.length > 0 ? totalSalaryPaid / allPayrolls.length : 0;
    
    const result = {
      totalPayrolls: allPayrolls.length,
      currentMonthPayrolls: currentMonthPayrolls.length,
      totalSalaryPaid,
      currentMonthSalary,
      averageSalary,
      totalWorkingDays: 22,
      actualWorkingDays: 22,
      leaveDays: currentMonthPayrolls.reduce((sum, p) => sum + (p.leaveDays || 0), 0),
      attendancePercentage: 100
    };
    
    console.log('🎯 EARLY endpoint sending result:', result);
    res.json(result);
  } catch (error) {
    console.error('🎯 EARLY payroll stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Notification routes
app.get('/api/notifications', auth, (req, res) => {
  try {
    const userNotifications = notifications.filter(n => n.recipientId === req.user.id);
    res.json(userNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', auth, (req, res) => {
  try {
    const notification = notifications.find(n => n.id === parseInt(req.params.id));
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    if (notification.recipientId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    notification.read = true;
    saveData('notifications', notifications);
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications/unread-count', auth, (req, res) => {
  try {
    const unreadCount = notifications.filter(n => n.recipientId === req.user.id && !n.read).length;
    res.json({ count: unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUserByEmail(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Initialize leave balance if not exists
    if (!user.leaveBalance) {
      user.leaveBalance = { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 };
    }
    
    res.json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        leaveBalance: user.leaveBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public user registration (for signup page)
app.post('/api/auth/register', (req, res) => {
  try {
    const { firstName, lastName, email, password, employeeId, department, position } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Check employee ID if provided
    if (employeeId) {
      const existingEmpId = users.find(u => u.employeeId === employeeId);
      if (existingEmpId) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }
    
    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `EMP${String(getNextId(users)).padStart(3, '0')}`;
    
    const newUser = {
      id: getNextId(users),
      firstName,
      lastName,
      email,
      password,
      employeeId: finalEmployeeId,
      role: 'employee', // All public registrations are employees
      department,
      position: position || 'Employee',
      manager: null, // Will be assigned by admin later
      leaveBalance: { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 },
      salary: {
        basicSalary: 0,
        allowances: {},
        deductions: {}
      },
      payrollInfo: {}
    };
    
    users.push(newUser);
    saveData('users', users);
    
    // Generate JWT token for auto-login after registration
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ 
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        position: newUser.position,
        employeeId: newUser.employeeId,
        leaveBalance: newUser.leaveBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin-only user creation (for admin panel)
app.post('/api/users', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create users' });
    }
    
    const { firstName, lastName, email, password, employeeId, role, department, position, managerId } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !department) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Check employee ID if provided
    if (employeeId) {
      const existingEmpId = users.find(u => u.employeeId === employeeId);
      if (existingEmpId) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }
    
    // Generate employee ID if not provided
    const finalEmployeeId = employeeId || `EMP${String(getNextId(users)).padStart(3, '0')}`;
    
    const newUser = {
      id: getNextId(users),
      firstName,
      lastName,
      email,
      password,
      employeeId: finalEmployeeId,
      role: role || 'employee',
      department,
      position: position || 'Employee',
      manager: managerId || null,
      leaveBalance: { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 },
      salary: {
        basicSalary: 0,
        allowances: {},
        deductions: {}
      },
      payrollInfo: {}
    };
    
    users.push(newUser);
    saveData('users', users);
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        position: newUser.position,
        employeeId: newUser.employeeId,
        leaveBalance: newUser.leaveBalance
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get('/api/auth/me', auth, (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        department: req.user.department,
        employeeId: req.user.employeeId,
        leaveBalance: req.user.leaveBalance,
        salary: req.user.salary
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User routes
app.get('/api/users', auth, (req, res) => {
  try {
    let filteredUsers = users;
    
    if (req.user.role === 'manager') {
      filteredUsers = users.filter(u => u.manager === req.user.id);
    }
    
    // Remove password from response
    const safeUsers = filteredUsers.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    res.json({ users: safeUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new user
app.post('/api/users', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create users' });
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      employeeId, 
      role, 
      department, 
      manager,
      salary,
      payrollInfo 
    } = req.body;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !employeeId || !role) {
      return res.status(400).json({ 
        message: 'First name, last name, email, password, employee ID, and role are required' 
      });
    }
    
    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    // Check if employee ID already exists
    const existingEmployeeId = users.find(u => u.employeeId === employeeId);
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }
    
    const newUser = {
      id: getNextId(users),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: password, // In production, this should be hashed
      employeeId: employeeId.trim(),
      role,
      department: department || 'IT',
      manager: manager || null,
      leaveBalance: {
        annual: 20,
        sick: 10,
        personal: 5,
        maternity: 90,
        paternity: 15
      },
      salary: salary || {
        basicSalary: 50000,
        hra: 20000,
        da: 15000,
        ta: 5000,
        pf: 6000,
        tax: 8000
      },
      payrollInfo: payrollInfo || {
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234'
      },
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData('users', users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      message: 'User created successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user
app.put('/api/users/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update users' });
    }
    
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      employeeId, 
      role, 
      department, 
      manager,
      salary,
      payrollInfo,
      leaveBalance 
    } = req.body;
    
    // Validation for required fields (password is optional for updates)
    if (!firstName || !lastName || !email || !employeeId || !role) {
      return res.status(400).json({ 
        message: 'First name, last name, email, employee ID, and role are required' 
      });
    }
    
    // Check if email already exists (excluding current user)
    if (email !== users[userIndex].email) {
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== parseInt(req.params.id));
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Check if employee ID already exists (excluding current user)
    if (employeeId !== users[userIndex].employeeId) {
      const existingEmployeeId = users.find(u => u.employeeId === employeeId && u.id !== parseInt(req.params.id));
      if (existingEmployeeId) {
        return res.status(400).json({ message: 'Employee ID already exists' });
      }
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      employeeId: employeeId.trim(),
      role,
      department: department || users[userIndex].department,
      manager: manager !== undefined ? manager : users[userIndex].manager,
      salary: salary || users[userIndex].salary,
      payrollInfo: payrollInfo || users[userIndex].payrollInfo,
      leaveBalance: leaveBalance || users[userIndex].leaveBalance,
      updatedAt: new Date().toISOString()
    };
    
    // Update password only if provided
    if (password && password.trim() !== '') {
      users[userIndex].password = password;
    }
    
    saveData('users', users);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ 
      message: 'User updated successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update user salary
app.put('/api/users/:id/salary', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update salary' });
    }
    
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const {
      basicSalary,
      hra,
      da,
      ta,
      pf,
      tax,
      performanceIncentive,
      specialAllowance,
      medicalAllowance,
      conveyanceAllowance,
      foodAllowance,
      otherAllowances
    } = req.body;
    
    // Validate required fields
    if (basicSalary === undefined || basicSalary < 0) {
      return res.status(400).json({ message: 'Valid basic salary is required' });
    }
    
    // Calculate totals
    const grossSalary = (basicSalary || 0) + (hra || 0) + (da || 0) + (ta || 0) + 
                       (performanceIncentive || 0) + (specialAllowance || 0) + 
                       (medicalAllowance || 0) + (conveyanceAllowance || 0) + 
                       (foodAllowance || 0) + (otherAllowances || 0);
    
    const totalDeductions = (pf || 0) + (tax || 0);
    const netSalary = grossSalary - totalDeductions;
    
    // Update user salary information
    users[userIndex].salary = {
      basicSalary: basicSalary || 0,
      hra: hra || 0,
      da: da || 0,
      ta: ta || 0,
      pf: pf || 0,
      tax: tax || 0,
      performanceIncentive: performanceIncentive || 0,
      specialAllowance: specialAllowance || 0,
      medicalAllowance: medicalAllowance || 0,
      conveyanceAllowance: conveyanceAllowance || 0,
      foodAllowance: foodAllowance || 0,
      otherAllowances: otherAllowances || 0,
      grossSalary,
      totalDeductions,
      netSalary
    };
    
    users[userIndex].updatedAt = new Date().toISOString();
    saveData('users', users);
    
    // Return updated user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({ 
      message: 'Salary updated successfully',
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Error updating salary:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single user
app.get('/api/users/:id', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Update leave balance
app.put('/api/users/:id/leave-balance', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only admins and managers can update leave balance' });
    }
    
    const userId = parseInt(req.params.id);
    const user = users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For managers, check if they can update this user's balance
    if (req.user.role === 'manager') {
      if (user.manager !== req.user.id) {
        return res.status(403).json({ message: 'You can only update leave balance for your direct reports' });
      }
    }
    
    // Initialize leave balance if not exists
    if (!user.leaveBalance) {
      user.leaveBalance = { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 };
    }
    
    // Update leave balance
    user.leaveBalance = { ...user.leaveBalance, ...req.body };
    
    res.json({ message: 'Leave balance updated successfully', leaveBalance: user.leaveBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user leave balance (with debug info)
app.get('/api/users/me/leave-balance', auth, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize leave balance if not exists
    if (!user.leaveBalance) {
      user.leaveBalance = { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 };
    }
    
    res.json({ 
      leaveBalance: user.leaveBalance,
      debug: {
        userId: user.id,
        userEmail: user.email,
        leaveBalanceExists: !!user.leaveBalance,
        leaveBalanceKeys: Object.keys(user.leaveBalance || {}),
        leaveTypes: leaveTypes.map(lt => ({ name: lt.name, code: lt.code, maxDays: lt.maxDays }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
app.get('/api/users/me/profile', auth, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      employeeId: req.user.employeeId,
      leaveBalance: req.user.leaveBalance,
      salary: req.user.salary,
      payrollInfo: req.user.payrollInfo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
app.put('/api/users/me/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    
    await req.user.update({
      firstName: firstName || req.user.firstName,
      lastName: lastName || req.user.lastName,
      email: email || req.user.email
    });
    
    res.json({ message: 'Profile updated successfully', user: req.user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave routes
app.get('/api/leaves', auth, (req, res) => {
  try {
    let filteredLeaves = leaves;
    
    if (req.user.role === 'employee') {
      filteredLeaves = leaves.filter(l => l.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      filteredLeaves = leaves.filter(l => teamMemberIds.includes(l.employeeId));
    }
    
    // Add employee info to leaves if not already there
    const leavesWithEmployee = filteredLeaves.map(leave => {
      if (!leave.employee) {
        const employee = findUserById(leave.employeeId);
        return {
          ...leave,
          employee: employee ? {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            employeeId: employee.employeeId,
            department: employee.department
          } : null
        };
      }
      return leave;
    });
    
    res.json({
      leaves: leavesWithEmployee,
      pagination: { current: 1, pages: 1, total: leavesWithEmployee.length }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit leave request
app.post('/api/leaves', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, duration } = req.body;
    
    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Leave type, start date, end date, and reason are required' });
    }
    
    const leaveDuration = duration || 1;
    
    // Find the user to check leave balance
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Initialize leave balance if not exists
    if (!user.leaveBalance) {
      user.leaveBalance = { annual: 20, sick: 10, personal: 5, maternity: 90, paternity: 15 };
    }
    
    // Check leave balance
    const availableBalance = user.leaveBalance[leaveType] || 0;
    if (availableBalance < leaveDuration) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. Available: ${availableBalance} days, Requested: ${leaveDuration} days` 
      });
    }
    
    // Check for date validity
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }
    
    if (start < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: 'Cannot submit leave for past dates' });
    }
    
    // Check for overlapping leaves
    const overlappingLeaves = leaves.filter(l => 
      l.employeeId === req.user.id && 
      (l.status === 'pending' || l.status === 'approved') &&
      ((new Date(l.startDate) <= end && new Date(l.endDate) >= start))
    );
    
    if (overlappingLeaves.length > 0) {
      return res.status(400).json({ message: 'Leave request overlaps with existing approved or pending leave' });
    }
    
    const newLeave = {
      id: getNextId(leaves),
      employeeId: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason,
      duration: leaveDuration,
      status: 'pending',
      createdAt: new Date().toISOString(),
      employee: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        employeeId: req.user.employeeId,
        department: req.user.department
      }
    };
    
    leaves.push(newLeave);
    saveData('leaves', leaves);
    
    // Send notification to manager
    const employee = req.user;
    notifyManager(
      employee.id,
      'leave_request',
      `${employee.firstName} ${employee.lastName} has applied for ${leaveType} leave from ${startDate} to ${endDate} (${duration} days)`,
      {
        leaveId: newLeave.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        leaveType,
        startDate,
        endDate,
        duration,
        reason
      }
    );

    // Send email notification to manager
    try {
      // Find managers and admins to notify
      const managersAndAdmins = users.filter(u => ['manager', 'admin'].includes(u.role));
      
      for (const manager of managersAndAdmins) {
        if (manager.email) {
          await sendLeaveApplicationEmail(
            manager.email,
            `${employee.firstName} ${employee.lastName}`,
            leaveType,
            startDate,
            endDate,
            reason
          );
        }
      }
    } catch (emailError) {
      console.error('Error sending leave application email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single leave
app.get('/api/leaves/:id', auth, (req, res) => {
  try {
    const leaveId = parseInt(req.params.id);
    const leave = leaves.find(l => l.id === leaveId);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check authorization
    if (req.user.role === 'employee' && leave.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this leave' });
    }
    
    // For managers, check if employee is in their team
    if (req.user.role === 'manager') {
      const employee = users.find(u => u.id === leave.employeeId);
      if (!employee || employee.manager !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this leave' });
      }
    }
    
    // Add employee information if not already there
    let leaveWithEmployee = leave;
    if (!leave.employee) {
      const employee = findUserById(leave.employeeId);
      leaveWithEmployee = {
        ...leave,
        employee: employee ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId,
          department: employee.department
        } : null
      };
    }
    
    res.json(leaveWithEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update leave
app.put('/api/leaves/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Only employee can update their own pending leave
    if (leave.employeeId !== req.user.id || leave.status !== 'pending') {
      return res.status(403).json({ message: 'Cannot update this leave request' });
    }
    
    const { leaveType, startDate, endDate, reason, duration } = req.body;
    
    await leave.update({
      leaveType: leaveType || leave.leaveType,
      startDate: startDate || leave.startDate,
      endDate: endDate || leave.endDate,
      reason: reason || leave.reason,
      duration: duration || leave.duration
    });
    
    res.json({ message: 'Leave request updated', leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject leave
app.put('/api/leaves/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Not authorized to approve leaves' });
    }
    
    const leaveId = parseInt(req.params.id);
    const leave = leaves.find(l => l.id === leaveId);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Check if user can approve this leave
    if (req.user.role === 'manager') {
      // Managers can only approve their team's leaves
      const employee = users.find(u => u.id === leave.employeeId);
      if (!employee || employee.manager !== req.user.id) {
        return res.status(403).json({ message: 'You can only approve leaves for your team members' });
      }
    }
    
    const { status, rejectionReason } = req.body;
    
    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be approved or rejected' });
    }
    
    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user.id;
    leave.approvedAt = new Date().toISOString();
    if (status === 'rejected' && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }
    
    // Handle leave balance changes
    const employee = users.find(u => u.id === leave.employeeId);
    if (employee && employee.leaveBalance) {
      const leaveType = leave.leaveType;
      const currentBalance = employee.leaveBalance[leaveType] || 0;
      
      if (status === 'approved') {
        // Deduct leave balance when approved
        employee.leaveBalance[leaveType] = Math.max(0, currentBalance - leave.duration);
      }
    }
    
    saveData('leaves', leaves);
    saveData('users', users);
    
    // Send notification to employee
    const manager = req.user;
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    let message = `Your ${leave.leaveType} leave request from ${leave.startDate} to ${leave.endDate} has been ${statusText} by ${manager.firstName} ${manager.lastName}`;
    
    if (status === 'rejected' && rejectionReason) {
      message += `. Reason: ${rejectionReason}`;
    }
    
    notifyEmployee(
      leave.employeeId,
      `leave_${status}`,
      message,
      {
        leaveId: leave.id,
        managerName: `${manager.firstName} ${manager.lastName}`,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        duration: leave.duration,
        status,
        rejectionReason: rejectionReason || null
      }
    );

    // Send email notification to employee
    try {
      if (employee && employee.email) {
        await sendLeaveApprovalEmail(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          leave.leaveType,
          leave.startDate,
          leave.endDate,
          status,
          `${manager.firstName} ${manager.lastName}`
        );
      }
    } catch (emailError) {
      console.error('Error sending leave approval email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ message: `Leave request ${status} successfully`, leave });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel leave
app.delete('/api/leaves/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findByPk(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    
    // Only employee can cancel their own pending leave
    if (leave.employeeId !== req.user.id || leave.status !== 'pending') {
      return res.status(403).json({ message: 'Cannot cancel this leave request' });
    }
    
    await leave.destroy();
    
    res.json({ message: 'Leave request cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard stats
app.get('/api/leaves/stats', auth, (req, res) => {
  try {
    let filteredLeaves = leaves;
    
    if (req.user.role === 'employee') {
      filteredLeaves = leaves.filter(l => l.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      filteredLeaves = leaves.filter(l => teamMemberIds.includes(l.employeeId));
    }
    
    const total = filteredLeaves.length;
    const pending = filteredLeaves.filter(l => l.status === 'pending').length;
    const approved = filteredLeaves.filter(l => l.status === 'approved').length;
    const rejected = filteredLeaves.filter(l => l.status === 'rejected').length;
    
    res.json({ total, pending, approved, rejected });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Attendance routes
app.post('/api/attendance/checkin', auth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    console.log('Check-in attempt:', {
      userId: req.user.id,
      today: today,
      currentTime: currentTime,
      attendanceCount: attendance.length
    });
    
    let attendanceRecord = attendance.find(a => a.employeeId === req.user.id && a.date === today);
    
    console.log('Existing attendance record:', attendanceRecord);
    
    if (attendanceRecord && attendanceRecord.checkIn) {
      console.log('Already checked in:', attendanceRecord.checkIn);
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    if (!attendanceRecord) {
      attendanceRecord = {
        id: getNextId(attendance),
        employeeId: req.user.id,
        date: today,
        checkIn: currentTime,
        status: 'present',
        workingHours: 0
      };
      attendance.push(attendanceRecord);
    } else {
      attendanceRecord.checkIn = currentTime;
      attendanceRecord.status = 'present';
    }
    
    saveData('attendance', attendance);
    
    res.json({ message: 'Checked in successfully', attendance: attendanceRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/attendance/checkout', auth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    const attendanceRecord = attendance.find(a => a.employeeId === req.user.id && a.date === today);
    
    if (!attendanceRecord || !attendanceRecord.checkIn) {
      return res.status(400).json({ message: 'Must check in first' });
    }
    
    if (attendanceRecord.checkOut) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    
    const checkInTime = new Date(`2000-01-01T${attendanceRecord.checkIn}:00`);
    const checkOutTime = new Date(`2000-01-01T${currentTime}:00`);
    const workingHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
    
    attendanceRecord.checkOut = currentTime;
    attendanceRecord.workingHours = Math.max(0, workingHours);
    
    saveData('attendance', attendance);
    
    res.json({ message: 'Checked out successfully', attendance: attendanceRecord });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records
app.get('/api/attendance', auth, (req, res) => {
  try {
    let filteredAttendance = attendance;
    
    if (req.user.role === 'employee') {
      filteredAttendance = attendance.filter(a => a.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      filteredAttendance = attendance.filter(a => teamMemberIds.includes(a.employeeId));
    }
    
    // Enrich attendance with employee information
    const enrichedAttendance = filteredAttendance.map(record => {
      const employee = users.find(u => u.id === record.employeeId);
      return {
        ...record,
        employee: employee ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        } : null
      };
    });
    
    // Sort by date descending
    enrichedAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(enrichedAttendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance stats
app.get('/api/attendance/stats', auth, (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
    const monthEnd = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-31`;
    
    let filteredAttendance = attendance.filter(a => {
      return a.date >= monthStart && a.date <= monthEnd;
    });
    
    if (req.user.role === 'employee') {
      filteredAttendance = filteredAttendance.filter(a => a.employeeId === req.user.id);
    }
    
    const totalDays = filteredAttendance.length;
    const presentDays = filteredAttendance.filter(a => a.status === 'present').length;
    const totalHours = filteredAttendance.reduce((sum, a) => sum + (a.workingHours || 0), 0);
    
    res.json({
      totalDays,
      presentDays,
      absentDays: totalDays - presentDays,
      totalHours: Math.round(totalHours * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get today's attendance status
app.get('/api/attendance/today', auth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = attendance.find(a => 
      a.employeeId === req.user.id && a.date === today
    );
    
    res.json(todayAttendance || { date: today, status: null });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Department routes - Public for registration
app.get('/api/departments', (req, res) => {
  try {
    // If no departments exist, create default ones
    if (departments.length === 0) {
      const defaultDepartments = [
        { id: 1, name: 'Human Resources', code: 'HR', isActive: true },
        { id: 2, name: 'Information Technology', code: 'IT', isActive: true },
        { id: 3, name: 'Finance', code: 'FIN', isActive: true },
        { id: 4, name: 'Marketing', code: 'MKT', isActive: true },
        { id: 5, name: 'Operations', code: 'OPS', isActive: true }
      ];
      departments.push(...defaultDepartments);
      saveData('departments', departments);
    }

    const departmentsWithData = departments.filter(dept => dept.isActive).map(dept => {
      const manager = dept.managerId ? findUserById(dept.managerId) : null;
      const employeeCount = users.filter(u => u.department === dept.name).length;
      
      return {
        ...dept,
        employeeCount,
        manager: manager ? {
          id: manager.id,
          firstName: manager.firstName,
          lastName: manager.lastName
        } : null
      };
    });
    
    res.json(departmentsWithData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/departments', auth, (req, res) => {
  try {
    // Authorization check
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can create departments',
        error: 'INSUFFICIENT_PERMISSIONS'
      });
    }
    
    const { name, code, description, isActive, managerId } = req.body;
    
    // Validation checks
    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Department name is required',
        error: 'VALIDATION_ERROR',
        field: 'name'
      });
    }
    
    if (name.length > 50) {
      return res.status(400).json({ 
        success: false,
        message: 'Department name must be less than 50 characters',
        error: 'VALIDATION_ERROR',
        field: 'name'
      });
    }
    
    // Validate managerId reference integrity (if provided)
    if (managerId) {
      const manager = findUserById(managerId);
      if (!manager) {
        return res.status(400).json({ 
          success: false,
          message: 'Invalid manager ID. Manager does not exist.',
          error: 'INVALID_REFERENCE',
          field: 'managerId'
        });
      }
      if (manager.role !== 'manager' && manager.role !== 'admin') {
        return res.status(400).json({ 
          success: false,
          message: 'Selected user must have manager or admin role.',
          error: 'INVALID_ROLE',
          field: 'managerId'
        });
      }
    }
    
    // Check if department name already exists
    const existingDept = departments.find(d => d.name.toLowerCase() === name.trim().toLowerCase());
    if (existingDept) {
      return res.status(409).json({ 
        success: false,
        message: 'Department name already exists',
        error: 'DUPLICATE_NAME',
        field: 'name'
      });
    }
    
    // Check if department code already exists
    if (code && code.trim() !== '') {
      const existingCode = departments.find(d => d.code === code.trim().toUpperCase());
      if (existingCode) {
        return res.status(409).json({ 
          success: false,
          message: 'Department code already exists',
          error: 'DUPLICATE_CODE',
          field: 'code'
        });
      }
    }
    
    // Create department
    const department = {
      id: getNextId(departments),
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : `DEPT${getNextId(departments)}`,
      description: description ? description.trim() : '',
      managerId: managerId || null,
      isActive: isActive !== undefined ? isActive : true,
      employeeCount: 0,
      createdAt: new Date().toISOString()
    };
    
    departments.push(department);
    saveData('departments', departments);
    
    // Success response
    res.status(201).json({ 
      success: true,
      message: 'Department created successfully',
      data: department
    });
    
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error while creating department',
      error: 'INTERNAL_ERROR'
    });
  }
});

// Get single department
app.get('/api/departments/:id', auth, (req, res) => {
  try {
    const department = departments.find(d => d.id === parseInt(req.params.id));
    
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Add employee count
    const employeeCount = users.filter(u => u.department === department.name).length;
    const departmentWithCount = {
      ...department,
      employeeCount
    };
    
    res.json(departmentWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update department
app.put('/api/departments/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update departments' });
    }
    
    const departmentIndex = departments.findIndex(d => d.id === parseInt(req.params.id));
    if (departmentIndex === -1) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    const { name, code, description, isActive, managerId } = req.body;
    
    // Check if new name already exists (excluding current department)
    if (name && name !== departments[departmentIndex].name) {
      const existingDept = departments.find(d => d.name.toLowerCase() === name.toLowerCase() && d.id !== parseInt(req.params.id));
      if (existingDept) {
        return res.status(400).json({ message: 'Department name already exists' });
      }
    }
    
    // Check if new code already exists (excluding current department)
    if (code && code !== departments[departmentIndex].code) {
      const existingCode = departments.find(d => d.code === code.toUpperCase() && d.id !== parseInt(req.params.id));
      if (existingCode) {
        return res.status(400).json({ message: 'Department code already exists' });
      }
    }
    
    // Validate managerId reference integrity (if provided)
    if (managerId !== undefined && managerId !== null) {
      const manager = findUserById(managerId);
      if (!manager) {
        return res.status(400).json({ message: 'Invalid manager ID. Manager does not exist.' });
      }
      if (manager.role !== 'manager' && manager.role !== 'admin') {
        return res.status(400).json({ message: 'Selected user must have manager or admin role.' });
      }
    }
    
    // Update department
    departments[departmentIndex] = {
      ...departments[departmentIndex],
      name: name || departments[departmentIndex].name,
      code: code ? code.toUpperCase() : departments[departmentIndex].code,
      description: description !== undefined ? description : departments[departmentIndex].description,
      managerId: managerId !== undefined ? managerId : departments[departmentIndex].managerId,
      isActive: isActive !== undefined ? isActive : departments[departmentIndex].isActive,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ message: 'Department updated successfully', department: departments[departmentIndex] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete department
app.delete('/api/departments/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete departments' });
    }
    
    const departmentIndex = departments.findIndex(d => d.id === parseInt(req.params.id));
    if (departmentIndex === -1) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    // Check if department has employees
    const employeesInDept = users.filter(u => u.department === departments[departmentIndex].name);
    if (employeesInDept.length > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. ${employeesInDept.length} employee(s) are assigned to this department.` 
      });
    }
    
    // Deactivate instead of deleting
    departments[departmentIndex].isActive = false;
    departments[departmentIndex].updatedAt = new Date().toISOString();
    
    res.json({ message: 'Department deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave Types routes
app.get('/api/leave-types', auth, (req, res) => {
  try {
    const activeLeaveTypes = leaveTypes.filter(lt => lt.isActive);
    res.json(activeLeaveTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/leave-types', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create leave types' });
    }
    
    const { name, code, defaultDays, color, description, isActive } = req.body;
    
    if (!name || !code || !defaultDays) {
      return res.status(400).json({ message: 'Name, code, and default days are required' });
    }
    
    // Check if leave type code already exists
    const existingLeaveType = leaveTypes.find(lt => lt.code.toLowerCase() === code.toLowerCase());
    if (existingLeaveType) {
      return res.status(400).json({ message: 'Leave type code already exists' });
    }
    
    const leaveType = {
      id: getNextId(leaveTypes),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      defaultDays: parseInt(defaultDays),
      color: color || 'blue',
      description: description ? description.trim() : '',
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString()
    };
    
    leaveTypes.push(leaveType);
    res.status(201).json(leaveType);
  } catch (error) {
    console.error('Error creating leave type:', error);
    res.status(500).json({ message: error.message });
  }
});

// Shifts routes
app.get('/api/shifts', auth, (req, res) => {
  try {
    const activeShifts = shifts.filter(shift => shift.isActive);
    res.json(activeShifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/shifts', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create shifts' });
    }
    
    const { name, startTime, endTime, breakTime, description, color, department } = req.body;
    
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Name, start time, and end time are required' });
    }
    
    // Check if shift name already exists
    const existingShift = shifts.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existingShift) {
      return res.status(400).json({ message: 'Shift name already exists' });
    }
    
    // Calculate total hours
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    let totalHours = (end - start) / (1000 * 60 * 60);
    
    if (totalHours < 0) {
      totalHours += 24; // Handle overnight shifts
    }
    
    totalHours -= (breakTime || 60) / 60; // Subtract break time
    
    const shift = {
      id: getNextId(shifts),
      name: name.trim(),
      startTime,
      endTime,
      breakTime: breakTime || 60,
      totalHours: Math.max(0, Math.round(totalHours * 100) / 100), // Round to 2 decimal places
      description: description ? description.trim() : '',
      color: color || '#3B82F6',
      department: department || '',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    shifts.push(shift);
    res.status(201).json(shift);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update shift
app.put('/api/shifts/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update shifts' });
    }
    
    const shiftIndex = shifts.findIndex(s => s.id === parseInt(req.params.id));
    if (shiftIndex === -1) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    const { name, startTime, endTime, breakTime, description, color, department, isActive } = req.body;
    
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Name, start time, and end time are required' });
    }
    
    // Check if new name already exists (excluding current shift)
    if (name !== shifts[shiftIndex].name) {
      const existingShift = shifts.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== parseInt(req.params.id));
      if (existingShift) {
        return res.status(400).json({ message: 'Shift name already exists' });
      }
    }
    
    // Calculate total hours
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    let totalHours = (end - start) / (1000 * 60 * 60);
    
    if (totalHours < 0) {
      totalHours += 24;
    }
    
    totalHours -= (breakTime || 60) / 60;
    
    shifts[shiftIndex] = {
      ...shifts[shiftIndex],
      name: name.trim(),
      startTime,
      endTime,
      breakTime: breakTime || 60,
      totalHours: Math.max(0, Math.round(totalHours * 100) / 100),
      description: description ? description.trim() : '',
      color: color || '#3B82F6',
      department: department || '',
      isActive: isActive !== undefined ? isActive : shifts[shiftIndex].isActive,
      updatedAt: new Date().toISOString()
    };
    
    res.json(shifts[shiftIndex]);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete shift
app.delete('/api/shifts/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete shifts' });
    }
    
    const shiftIndex = shifts.findIndex(s => s.id === parseInt(req.params.id));
    if (shiftIndex === -1) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    // Soft delete - mark as inactive instead of removing
    shifts[shiftIndex].isActive = false;
    shifts[shiftIndex].updatedAt = new Date().toISOString();
    
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get payroll records
app.get('/api/payroll', auth, (req, res) => {
  try {
    let filteredPayrolls = payrolls;
    
    if (req.user.role === 'employee') {
      filteredPayrolls = payrolls.filter(p => p.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      // Get team members managed by this user
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      filteredPayrolls = payrolls.filter(p => teamMemberIds.includes(p.employeeId));
    }
    
    // Enrich payrolls with employee information
    const enrichedPayrolls = filteredPayrolls.map(payroll => {
      const employee = users.find(u => u.id === payroll.employeeId);
      return {
        ...payroll,
        employee: employee ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        } : null
      };
    });
    
    // Sort by year and month (descending)
    enrichedPayrolls.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    res.json(enrichedPayrolls);
  } catch (error) {
    console.error('Error fetching payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single payroll record
app.get('/api/payroll/:id', auth, (req, res) => {
  try {
    const payrollId = parseInt(req.params.id);
    const payroll = payrolls.find(p => p.id === payrollId);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }
    
    // Check permissions - employees can only view their own payroll
    if (req.user.role === 'employee' && payroll.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this payroll record' });
    }
    
    // For managers, check if the employee is in their team
    if (req.user.role === 'manager') {
      const employee = users.find(u => u.id === payroll.employeeId);
      if (!employee || employee.manager !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this payroll record' });
      }
    }
    
    // Enrich with employee information
    const employee = users.find(u => u.id === payroll.employeeId);
    const enrichedPayroll = {
      ...payroll,
      employee: employee ? {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId,
        department: employee.department,
        email: employee.email
      } : null
    };
    
    res.json(enrichedPayroll);
  } catch (error) {
    console.error('Error fetching payroll details:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create/Update payroll
app.post('/api/payroll', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create payroll records' });
    }
    
    const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;
    
    // Validate required fields
    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: 'Employee ID, month, and year are required' });
    }
    
    // Check if employee exists
    const employee = users.find(u => u.id === parseInt(employeeId));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Calculate gross and net salary
    const allowanceTotal = Object.values(allowances || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const deductionTotal = Object.values(deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const grossSalary = parseFloat(basicSalary || 0) + allowanceTotal;
    const netSalary = grossSalary - deductionTotal;
    
    // Check if payroll already exists
    const existingPayrollIndex = payrolls.findIndex(p => 
      p.employeeId === parseInt(employeeId) && p.month === parseInt(month) && p.year === parseInt(year)
    );
    
    if (existingPayrollIndex !== -1) {
      // Update existing payroll
      payrolls[existingPayrollIndex] = {
        ...payrolls[existingPayrollIndex],
        basicSalary: parseFloat(basicSalary || 0),
        allowances: allowances || {},
        deductions: deductions || {},
        grossSalary,
        netSalary,
        processedBy: req.user.id,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      res.json({ message: 'Payroll updated successfully', payroll: payrolls[existingPayrollIndex] });
    } else {
      // Create new payroll
      const newPayroll = {
        id: getNextId(payrolls),
        employeeId: parseInt(employeeId),
        month: parseInt(month),
        year: parseInt(year),
        basicSalary: parseFloat(basicSalary || 0),
        allowances: allowances || {},
        deductions: deductions || {},
        grossSalary,
        netSalary,
        status: 'processed',
        processedBy: req.user.id,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      payrolls.push(newPayroll);
      saveData('payrolls', payrolls);
      res.status(201).json({ message: 'Payroll created successfully', payroll: newPayroll });
    }
  } catch (error) {
    console.error('Error creating/updating payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate bulk payroll from user salary info
app.post('/api/payroll/bulk', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can generate bulk payroll' });
    }
    
    const { month, year } = req.body;
    
    // Validate required fields
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }
    
    // Get users with salary information
    const usersWithSalary = users.filter(user => user.salary && user.salary.basicSalary);
    
    const payrollRecords = [];
    
    for (const user of usersWithSalary) {
      const salary = user.salary;
      
      // Check if payroll already exists for this user and period
      const existingPayroll = payrolls.find(p => 
        p.employeeId === user.id && p.month === parseInt(month) && p.year === parseInt(year)
      );
      
      if (!existingPayroll) {
        // Calculate leave days for the month
        const monthLeaves = leaves.filter(l => 
          l.employeeId === user.id && 
          l.status === 'approved' &&
          new Date(l.startDate).getMonth() === parseInt(month) - 1 &&
          new Date(l.startDate).getFullYear() === parseInt(year)
        );
        
        const leaveDays = monthLeaves.reduce((total, leave) => total + (leave.duration || 0), 0);
        const standardWorkingDays = 22;
        const actualWorkingDays = Math.max(0, standardWorkingDays - leaveDays);
        
        const allowances = {
          hra: salary.hra || 0,
          da: salary.da || 0,
          ta: salary.ta || 0,
          performanceIncentive: salary.performanceIncentive || 0,
          specialAllowance: salary.specialAllowance || 0,
          medicalAllowance: salary.medicalAllowance || 0,
          conveyanceAllowance: salary.conveyanceAllowance || 0,
          foodAllowance: salary.foodAllowance || 0,
          otherAllowances: salary.otherAllowances || 0
        };
        
        const deductions = {
          pf: salary.pf || 0,
          tax: salary.tax || 0
        };
        
        const allowanceTotal = Object.values(allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const deductionTotal = Object.values(deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        const grossSalary = parseFloat(salary.basicSalary) + allowanceTotal;
        const netSalary = grossSalary - deductionTotal;
        
        const newPayroll = {
          id: getNextId(payrolls),
          employeeId: user.id,
          month: parseInt(month),
          year: parseInt(year),
          basicSalary: salary.basicSalary,
          hra: salary.hra || 0,
          da: salary.da || 0,
          ta: salary.ta || 0,
          bonus: 0,
          pf: salary.pf || 0,
          tax: salary.tax || 0,
          grossSalary,
          deductions: deductionTotal,
          netSalary,
          workingDays: standardWorkingDays,
          actualWorkingDays,
          leaveDays,
          payDate: null,
          status: 'processed',
          processedBy: req.user.id,
          processedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        };
        
        payrolls.push(newPayroll);
        payrollRecords.push(newPayroll);
      }
    }
    
    saveData('payrolls', payrolls);
    
    res.json({ 
      message: `Bulk payroll generated for ${payrollRecords.length} employees`,
      count: payrollRecords.length,
      records: payrollRecords
    });
  } catch (error) {
    console.error('Error generating bulk payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// Generate individual payroll (for the payroll form)
app.post('/api/payroll/generate', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can generate payroll' });
    }
    
    const { employeeId, month, year, workingDays } = req.body;
    
    // Validate required fields
    if (!employeeId || !month || !year) {
      return res.status(400).json({ message: 'Employee ID, month, and year are required' });
    }
    
    // Find the employee
    const employee = users.find(u => u.id === parseInt(employeeId));
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if employee has salary information
    if (!employee.salary || !employee.salary.basicSalary) {
      return res.status(400).json({ message: 'Employee salary information not found' });
    }
    
    // Check if payroll already exists for this period
    const existingPayroll = payrolls.find(p => 
      p.employeeId === parseInt(employeeId) && 
      p.month === parseInt(month) && 
      p.year === parseInt(year)
    );
    
    if (existingPayroll) {
      return res.status(400).json({ message: 'Payroll already exists for this employee and period' });
    }
    
    const salary = employee.salary;
    
    // Calculate leave days for the month
    const monthLeaves = leaves.filter(l => 
      l.employeeId === parseInt(employeeId) && 
      l.status === 'approved' &&
      new Date(l.startDate).getMonth() === parseInt(month) - 1 &&
      new Date(l.startDate).getFullYear() === parseInt(year)
    );
    
    const leaveDays = monthLeaves.reduce((total, leave) => total + (leave.duration || 0), 0);
    
    // Calculate pro-rated salary based on working days (assuming 22 working days per month)
    const standardWorkingDays = 22;
    const totalWorkingDays = workingDays || standardWorkingDays;
    const actualWorkingDays = Math.max(0, totalWorkingDays - leaveDays);
    const salaryMultiplier = actualWorkingDays / standardWorkingDays;
    
    // Calculate allowances and deductions
    const basicSalary = Math.round(salary.basicSalary * salaryMultiplier);
    const hra = Math.round((salary.hra || 0) * salaryMultiplier);
    const da = Math.round((salary.da || 0) * salaryMultiplier);
    const ta = Math.round((salary.ta || 0) * salaryMultiplier);
    const performanceIncentive = salary.performanceIncentive || 0; // Usually not pro-rated
    const specialAllowance = Math.round((salary.specialAllowance || 0) * salaryMultiplier);
    const medicalAllowance = Math.round((salary.medicalAllowance || 0) * salaryMultiplier);
    const conveyanceAllowance = Math.round((salary.conveyanceAllowance || 0) * salaryMultiplier);
    const foodAllowance = Math.round((salary.foodAllowance || 0) * salaryMultiplier);
    const otherAllowances = Math.round((salary.otherAllowances || 0) * salaryMultiplier);
    
    const pf = Math.round((salary.pf || 0) * salaryMultiplier);
    const tax = Math.round((salary.tax || 0) * salaryMultiplier);
    
    // Calculate totals
    const grossSalary = basicSalary + hra + da + ta + performanceIncentive + 
                       specialAllowance + medicalAllowance + conveyanceAllowance + 
                       foodAllowance + otherAllowances;
    const totalDeductions = pf + tax;
    const netSalary = grossSalary - totalDeductions;
    
    // Create new payroll record
    const newPayroll = {
      id: getNextId(payrolls),
      employeeId: parseInt(employeeId),
      month: parseInt(month),
      year: parseInt(year),
      basicSalary,
      hra,
      da,
      ta,
      bonus: performanceIncentive,
      pf,
      tax,
      grossSalary,
      deductions: totalDeductions,
      netSalary,
      workingDays: totalWorkingDays,
      actualWorkingDays,
      leaveDays,
      payDate: null,
      status: 'generated',
      processedBy: req.user.id,
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    payrolls.push(newPayroll);
    saveData('payrolls', payrolls);
    
    // Also add employee information for response
    const { password: _, ...employeeInfo } = employee;
    
    res.status(201).json({ 
      message: 'Payroll generated successfully',
      payroll: {
        ...newPayroll,
        employee: employeeInfo
      }
    });
  } catch (error) {
    console.error('Error generating payroll:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', timestamp: new Date() });
});

// Simple test route (now with attendance fix)
app.get('/api/simple-test', (req, res) => {
  // Check if fix parameter is passed
  if (req.query.fix === 'attendance') {
    const today = new Date().toISOString().split('T')[0];
    const initialLength = attendance.length;
    attendance = attendance.filter(a => a.date !== today);
    saveData('attendance', attendance);
    
    return res.json({
      message: 'Attendance fixed! All records for today cleared.',
      cleared: initialLength - attendance.length,
      remaining: attendance.length,
      date: today,
      serverTime: new Date().toISOString()
    });
  }
  
  res.json({ 
    message: 'Simple test working',
    serverTime: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// Public attendance fix endpoint (no auth needed)
app.get('/api/fix-attendance', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Clear ALL attendance records for today (for all users)
  const initialLength = attendance.length;
  attendance = attendance.filter(a => a.date !== today);
  
  saveData('attendance', attendance);
  
  res.json({
    message: 'All attendance records for today have been cleared',
    cleared: initialLength - attendance.length,
    remaining: attendance.length,
    date: today
  });
});

// Debug departments endpoint (no auth needed)
app.get('/api/debug/departments', (req, res) => {
  res.json({
    totalDepartments: departments.length,
    activeDepartments: departments.filter(d => d.isActive).length,
    departments: departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      isActive: dept.isActive
    }))
  });
});

// Create default departments (no auth needed)
app.get('/api/setup-departments', (req, res) => {
  const defaultDepartments = [
    { id: 1, name: 'Human Resources', code: 'HR', isActive: true },
    { id: 2, name: 'Information Technology', code: 'IT', isActive: true },
    { id: 3, name: 'Finance', code: 'FIN', isActive: true },
    { id: 4, name: 'Marketing', code: 'MKT', isActive: true },
    { id: 5, name: 'Operations', code: 'OPS', isActive: true }
  ];

  // Only add if no departments exist
  if (departments.length === 0) {
    departments.push(...defaultDepartments);
    saveData('departments', departments);
    res.json({
      message: 'Default departments created successfully',
      departments: departments
    });
  } else {
    res.json({
      message: 'Departments already exist',
      count: departments.length,
      departments: departments
    });
  }
});

// Debug endpoint for attendance
app.get('/api/debug/attendance', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const userAttendance = attendance.filter(a => a.employeeId === req.user.id);
  const todayAttendance = attendance.find(a => a.employeeId === req.user.id && a.date === today);
  
  res.json({
    userId: req.user.id,
    today: today,
    totalAttendanceRecords: attendance.length,
    userAttendanceRecords: userAttendance.length,
    todayAttendance: todayAttendance,
    allUserAttendance: userAttendance
  });
});

// Clear today's attendance (for debugging) - GET version for easy browser access
app.get('/api/debug/clear-today-attendance-get', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const initialLength = attendance.length;
  
  // Remove today's attendance record for this user
  const index = attendance.findIndex(a => a.employeeId === req.user.id && a.date === today);
  
  if (index !== -1) {
    attendance.splice(index, 1);
    saveData('attendance', attendance);
    res.json({ 
      message: 'Today\'s attendance record cleared successfully',
      removed: true,
      before: initialLength,
      after: attendance.length
    });
  } else {
    res.json({ 
      message: 'No attendance record found for today',
      removed: false,
      attendanceCount: attendance.length
    });
  }
});

// Clear today's attendance (for debugging)
app.delete('/api/debug/clear-today-attendance', auth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const initialLength = attendance.length;
  
  // Remove today's attendance record for this user
  const index = attendance.findIndex(a => a.employeeId === req.user.id && a.date === today);
  
  if (index !== -1) {
    attendance.splice(index, 1);
    saveData('attendance', attendance);
    res.json({ 
      message: 'Today\'s attendance record cleared successfully',
      removed: true,
      before: initialLength,
      after: attendance.length
    });
  } else {
    res.json({ 
      message: 'No attendance record found for today',
      removed: false,
      attendanceCount: attendance.length
    });
  }
});

// Test payroll route without auth - defined after data loading
app.get('/api/payroll/test', (req, res) => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Check if payrolls variable exists
    if (typeof payrolls === 'undefined') {
      return res.json({
        error: 'Payrolls variable not defined',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      message: 'Payroll endpoint working',
      payrollCount: Array.isArray(payrolls) ? payrolls.length : 'Not an array',
      currentDate: { month: currentMonth, year: currentYear },
      payrollsType: typeof payrolls,
      samplePayrolls: Array.isArray(payrolls) && payrolls.length > 0 ? payrolls.slice(0, 3).map(p => ({
        id: p.id,
        employeeId: p.employeeId,
        month: p.month,
        year: p.year,
        netSalary: p.netSalary
      })) : 'No payrolls available',
      currentMonthPayrolls: Array.isArray(payrolls) ? payrolls.filter(p => p.month === currentMonth && p.year === currentYear).length : 'Cannot filter'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error in payroll test',
      message: error.message,
      stack: error.stack
    });
  }
});

// Payroll stats
app.get('/api/payroll/stats', auth, (req, res) => {
  try {
    console.log('Payroll stats endpoint hit!', { userRole: req.user.role, userId: req.user.id });
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    console.log(`Payroll Stats Debug:`, {
      currentMonth,
      currentYear,
      totalPayrollsInSystem: payrolls.length,
      payrollSample: payrolls.slice(0, 2).map(p => ({ id: p.id, month: p.month, year: p.year, employeeId: p.employeeId }))
    });
    
    let allPayrolls = payrolls || [];
    let currentMonthPayrolls = payrolls.filter(p => p.month === currentMonth && p.year === currentYear);
    
    console.log('Filtered payrolls:', { 
      allCount: allPayrolls.length, 
      currentMonthCount: currentMonthPayrolls.length 
    });
    
    // Filter based on user role
    if (req.user.role === 'employee') {
      allPayrolls = allPayrolls.filter(p => p.employeeId === req.user.id);
      currentMonthPayrolls = currentMonthPayrolls.filter(p => p.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      allPayrolls = allPayrolls.filter(p => teamMemberIds.includes(p.employeeId));
      currentMonthPayrolls = currentMonthPayrolls.filter(p => teamMemberIds.includes(p.employeeId));
    }
    
    const totalSalaryPaid = allPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const currentMonthSalary = currentMonthPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const averageSalary = allPayrolls.length > 0 ? totalSalaryPaid / allPayrolls.length : 0;
    
    const result = {
      totalPayrolls: allPayrolls.length,
      currentMonthPayrolls: currentMonthPayrolls.length,
      totalSalaryPaid,
      currentMonthSalary,
      averageSalary,
      // Additional working days info
      totalWorkingDays: 22,
      actualWorkingDays: 22,
      leaveDays: currentMonthPayrolls.reduce((sum, p) => sum + (p.leaveDays || 0), 0),
      attendancePercentage: 100
    };
    
    console.log('Sending payroll stats:', result);
    res.json(result);
  } catch (error) {
    console.error('Payroll stats error:', error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Debug endpoint to check payroll data
app.get('/api/debug/payrolls', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin only' });
  }
  
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  res.json({
    currentDate: { month: currentMonth, year: currentYear },
    totalPayrolls: payrolls.length,
    currentMonthPayrolls: payrolls.filter(p => p.month === currentMonth && p.year === currentYear),
    allPayrolls: payrolls
  });
});

// Performance goals
app.get('/api/performance-goals', auth, (req, res) => {
  try {
    let filteredGoals = goals;
    
    if (req.user.role === 'employee') {
      filteredGoals = goals.filter(g => g.employeeId === req.user.id);
    } else if (req.user.role === 'manager') {
      const teamMemberIds = users.filter(u => u.manager === req.user.id).map(u => u.id);
      filteredGoals = goals.filter(g => teamMemberIds.includes(g.employeeId));
    }
    
    // Add employee and setter info
    const goalsWithDetails = filteredGoals.map(goal => {
      const employee = findUserById(goal.employeeId);
      const setter = findUserById(goal.setBy);
      
      return {
        ...goal,
        employee: employee ? {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          employeeId: employee.employeeId
        } : null,
        setter: setter ? {
          id: setter.id,
          firstName: setter.firstName,
          lastName: setter.lastName
        } : null
      };
    });
    
    res.json(goalsWithDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create goal
app.post('/api/performance-goals', auth, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Only managers and admins can create goals' });
    }
    
    const { employeeId, title, description, category, priority, targetDate } = req.body;
    
    const goal = {
      id: getNextId(goals),
      employeeId,
      title,
      description,
      category,
      priority: priority || 'medium',
      targetDate,
      setBy: req.user.id,
      status: 'pending',
      progress: 0,
      createdAt: new Date().toISOString()
    };
    
    goals.push(goal);
    saveData('goals', goals);
    
    res.status(201).json({ message: 'Goal created successfully', goal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update goal
app.put('/api/performance-goals/:id', auth, (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    const goal = goals[goalIndex];
    
    // Check authorization
    if (req.user.role === 'employee' && goal.employeeId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this goal' });
    }
    
    const { title, description, category, priority, targetDate, status, progress, notes } = req.body;
    
    // Update the goal
    goals[goalIndex] = {
      ...goal,
      title: title || goal.title,
      description: description || goal.description,
      category: category || goal.category,
      priority: priority || goal.priority,
      targetDate: targetDate || goal.targetDate,
      status: status || goal.status,
      progress: progress !== undefined ? progress : goal.progress,
      notes: notes || goal.notes,
      completionDate: status === 'completed' ? new Date().toISOString().split('T')[0] : goal.completionDate,
      updatedAt: new Date().toISOString()
    };
    
    res.json({ message: 'Goal updated successfully', goal: goals[goalIndex] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete goal
app.delete('/api/performance-goals/:id', auth, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Only managers and admins can delete goals' });
    }
    
    const goalId = parseInt(req.params.id);
    const goalIndex = goals.findIndex(g => g.id === goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Remove the goal from array
    goals.splice(goalIndex, 1);
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Notifications endpoint
app.get('/api/notifications', auth, (req, res) => {
  try {
    // Return empty notifications for now
    const notifications = [];
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Performance reviews endpoint
app.get('/api/performance-reviews', auth, (req, res) => {
  try {
    // Add some sample reviews
    const reviews = [
      {
        id: 1,
        employeeId: 3,
        reviewerId: 2,
        period: 'Q1 2024',
        overallRating: 4.2,
        goals: 'Complete React training, improve team collaboration',
        achievements: 'Successfully delivered 3 major projects',
        areasForImprovement: 'Time management, documentation',
        strengths: [
          'Excellent technical skills',
          'Great team collaboration',
          'Quick learning ability',
          'Reliable delivery'
        ],
        areasOfImprovement: [
          'Time management skills',
          'Documentation practices',
          'Communication with stakeholders'
        ],
        status: 'completed',
        performanceIncentive: 5000,
        createdAt: '2024-03-01T00:00:00.000Z',
        reviewer: {
          id: 2,
          firstName: 'Manager',
          lastName: 'User'
        },
        employee: {
          id: 3,
          firstName: 'Employee',
          lastName: 'User',
          employeeId: 'EMP003'
        }
      }
    ];
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create performance review
app.post('/api/performance-reviews', auth, (req, res) => {
  try {
    if (req.user.role === 'employee') {
      return res.status(403).json({ message: 'Only managers and admins can create reviews' });
    }

    const { employeeId, period, overallRating, goals, achievements, areasForImprovement, performanceIncentive } = req.body;
    
    const employee = findUserById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const review = {
      id: Date.now(), // Simple ID generation
      employeeId: parseInt(employeeId),
      reviewerId: req.user.id,
      period,
      overallRating: parseFloat(overallRating),
      goals,
      achievements,
      areasForImprovement,
      performanceIncentive: parseFloat(performanceIncentive) || 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      reviewer: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      },
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId
      }
    };

    res.status(201).json({ message: 'Performance review created successfully', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Promotions endpoint
app.get('/api/promotions', auth, (req, res) => {
  try {
    // Sample promotions data
    const promotions = [
      {
        id: 1,
        employeeId: 3,
        fromPosition: 'Junior Developer',
        toPosition: 'Senior Developer',
        effectiveDate: '2024-04-01',
        salaryIncrease: 15000,
        reason: 'Outstanding performance and leadership skills',
        status: 'approved',
        approvedBy: 1,
        createdAt: '2024-03-15T00:00:00.000Z',
        employee: {
          id: 3,
          firstName: 'Employee',
          lastName: 'User',
          employeeId: 'EMP003'
        }
      }
    ];
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create promotion
app.post('/api/promotions', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create promotions' });
    }

    const { employeeId, fromPosition, toPosition, effectiveDate, salaryIncrease, reason } = req.body;
    
    const employee = findUserById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const promotion = {
      id: Date.now(),
      employeeId: parseInt(employeeId),
      fromPosition,
      toPosition,
      effectiveDate,
      salaryIncrease: parseFloat(salaryIncrease) || 0,
      reason,
      status: 'approved',
      approvedBy: req.user.id,
      createdAt: new Date().toISOString(),
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeId: employee.employeeId
      }
    };

    res.status(201).json({ message: 'Promotion created successfully', promotion });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Performance stats endpoint
app.get('/api/performance/stats', auth, (req, res) => {
  try {
    // Return comprehensive performance stats
    const stats = {
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      inProgressGoals: goals.filter(g => g.status === 'in_progress').length,
      pendingGoals: goals.filter(g => g.status === 'pending').length,
      averageProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length : 0,
      totalReviews: 1, // Sample count
      totalIncentives: 5000, // Sample total
      totalPromotions: 1 // Sample count
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  try {
    res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// KPIs endpoint
app.get('/api/kpis', auth, (req, res) => {
  try {
    // Return sample KPIs
    const kpis = [
      {
        id: 1,
        name: 'Customer Satisfaction',
        value: 4.8,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        change: '+0.3'
      },
      {
        id: 2,
        name: 'Project Completion Rate',
        value: 92,
        target: 90,
        unit: '%',
        trend: 'up',
        change: '+2%'
      },
      {
        id: 3,
        name: 'Team Productivity',
        value: 87,
        target: 85,
        unit: '%',
        trend: 'up',
        change: '+5%'
      },
      {
        id: 4,
        name: 'Training Hours',
        value: 24,
        target: 20,
        unit: 'hrs',
        trend: 'up',
        change: '+4hrs'
      }
    ];
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Leave Management Server running on port ${PORT}`);
  console.log(`💾 Data persistence enabled - files saved to: ${DATA_DIR}`);
  console.log(`👥 Demo users:`);
  console.log(`   Admin: admin@company.com / password123`);
  console.log(`   Manager: manager@company.com / password123`);
  console.log(`   Employee: employee@company.com / password123`);
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
  
  // Test email configuration
  console.log('\n📧 Testing email configuration...');
  await testEmailConfig();
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received, saving data and shutting down gracefully...');
  saveAllData();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, saving data and shutting down gracefully...');
  saveAllData();
  process.exit(0);
});

// Save data on exit
process.on('exit', () => {
  console.log('Process exiting, saving data...');
  saveAllData();
});
