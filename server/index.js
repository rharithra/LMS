const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key';

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Your email
    pass: process.env.EMAIL_PASS || 'your-app-password' // Your app password
  }
});

// Email templates
const emailTemplates = {
  leaveRequest: (employeeName, managerName, leaveType, duration) => ({
    subject: 'New Leave Request Submitted',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Leave Request</h2>
        <p>Hello ${managerName},</p>
        <p>${employeeName} has submitted a new leave request:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Duration:</strong> ${duration} day(s)</p>
          <p><strong>Status:</strong> Pending Approval</p>
        </div>
        <p>Please log in to the Leave Management System to review and approve this request.</p>
        <p>Best regards,<br>Leave Management System</p>
      </div>
    `
  }),
  
  leaveApproved: (employeeName, leaveType, duration, approverName) => ({
    subject: 'Leave Request Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Leave Request Approved</h2>
        <p>Hello ${employeeName},</p>
        <p>Your leave request has been approved by ${approverName}:</p>
        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Duration:</strong> ${duration} day(s)</p>
          <p><strong>Status:</strong> ✅ Approved</p>
        </div>
        <p>Your leave balance has been updated accordingly.</p>
        <p>Best regards,<br>Leave Management System</p>
      </div>
    `
  }),
  
  leaveRejected: (employeeName, leaveType, duration, approverName, reason) => ({
    subject: 'Leave Request Rejected',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Leave Request Rejected</h2>
        <p>Hello ${employeeName},</p>
        <p>Your leave request has been rejected by ${approverName}:</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <p><strong>Leave Type:</strong> ${leaveType}</p>
          <p><strong>Duration:</strong> ${duration} day(s)</p>
          <p><strong>Status:</strong> ❌ Rejected</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        <p>Please contact your manager if you have any questions.</p>
        <p>Best regards,<br>Leave Management System</p>
      </div>
    `
  })
};

// Helper function to send emails
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](...data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory data store for demo
const users = [
  {
    id: 1,
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    employeeId: 'EMP001',
    role: 'admin',
    department: 'HR',
    leaveBalance: { annual: 25, sick: 15, personal: 7 }
  },
  {
    id: 2,
    firstName: 'Manager',
    lastName: 'User',
    email: 'manager@company.com',
    employeeId: 'EMP002',
    role: 'manager',
    department: 'IT',
    leaveBalance: { annual: 20, sick: 10, personal: 5 }
  },
  {
    id: 3,
    firstName: 'Employee',
    lastName: 'User',
    email: 'employee@company.com',
    employeeId: 'EMP003',
    role: 'employee',
    department: 'IT',
    manager: 2, // Reports to Manager
    leaveBalance: { annual: 20, sick: 10, personal: 5 }
  },
  {
    id: 4,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    employeeId: 'EMP004',
    role: 'employee',
    department: 'IT',
    manager: 2, // Reports to Manager
    leaveBalance: { annual: 18, sick: 8, personal: 3 }
  }
];

const leaves = [];

// Simple authentication middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Simple token validation (demo only)
  const userId = parseInt(token);
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  
  req.user = user;
  next();
};

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user || password !== 'password123') {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  res.json({
    message: 'Login successful',
    token: user.id.toString(),
    user
  });
});

app.get('/api/auth/me', auth, (req, res) => {
  res.json(req.user);
});

// Get users (for managers and admins)
app.get('/api/users', auth, (req, res) => {
  if (req.user.role === 'employee') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  let filteredUsers = users;
  
  // Managers can only see their team members
  if (req.user.role === 'manager') {
    filteredUsers = users.filter(user => user.manager === req.user.id);
  }
  
  res.json({ users: filteredUsers });
});

// Add new user
app.post('/api/users', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create users' });
  }
  
  const { firstName, lastName, email, employeeId, role, department, manager } = req.body;
  
  if (!firstName || !lastName || !email || !employeeId || !role || !department) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if email already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    employeeId,
    role,
    department,
    manager: manager || null,
    leaveBalance: { annual: 20, sick: 10, personal: 5 }
  };
  
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put('/api/users/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update users' });
  }
  
  const { id } = req.params;
  const { firstName, lastName, email, employeeId, role, department, manager, leaveBalance } = req.body;
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update user
  users[userIndex] = {
    ...users[userIndex],
    firstName,
    lastName,
    email,
    employeeId,
    role,
    department,
    manager: manager || null,
    leaveBalance: leaveBalance || users[userIndex].leaveBalance
  };
  
  res.json({ 
    message: 'User updated successfully',
    user: users[userIndex]
  });
});

// Leave routes
app.get('/api/leaves', auth, (req, res) => {
  let userLeaves;
  
  if (req.user.role === 'employee') {
    // Employees see only their own leaves
    userLeaves = leaves.filter(l => l.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    // Managers see their team's leaves
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userLeaves = leaves.filter(l => teamMemberIds.includes(l.employeeId));
  } else {
    // Admins see all leaves
    userLeaves = leaves;
  }
  
  // Add employee information to each leave
  const leavesWithEmployee = userLeaves.map(leave => {
    const employee = users.find(u => u.id === leave.employeeId);
    return {
      ...leave,
      employee: employee ? {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.department
      } : null
    };
  });
  
  res.json({
    leaves: leavesWithEmployee,
    pagination: { current: 1, pages: 1, total: leavesWithEmployee.length }
  });
});

app.post('/api/leaves', auth, (req, res) => {
  const { leaveType, startDate, endDate, reason, duration } = req.body;
  
  const newLeave = {
    id: leaves.length + 1,
    employeeId: req.user.id,
    employee: req.user,
    leaveType,
    startDate,
    endDate,
    reason,
    duration,
    status: 'pending',
    createdAt: new Date()
  };
  
  leaves.push(newLeave);
  
  // Create notification for manager
  if (req.user.manager) {
    const manager = users.find(u => u.id === req.user.manager);
    if (manager) {
      createNotification(
        manager.id,
        'New Leave Request',
        `${req.user.firstName} ${req.user.lastName} has submitted a ${leaveType} leave request for ${duration} day(s)`,
        'leave_request',
        newLeave.id
      );
      
      // Send email notification to manager
      sendEmail(
        manager.email,
        'leaveRequest',
        [
          `${req.user.firstName} ${req.user.lastName}`,
          `${manager.firstName} ${manager.lastName}`,
          leaveType,
          duration
        ]
      );
    }
  }
  
  res.status(201).json({ message: 'Leave request submitted', leave: newLeave });
});

// Dashboard stats
app.get('/api/leaves/stats', auth, (req, res) => {
  let userLeaves;
  
  if (req.user.role === 'employee') {
    // Employees see only their own leaves
    userLeaves = leaves.filter(l => l.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    // Managers see their team's leaves
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userLeaves = leaves.filter(l => teamMemberIds.includes(l.employeeId));
  } else {
    // Admins see all leaves
    userLeaves = leaves;
  }
  
  res.json({
    total: userLeaves.length,
    pending: userLeaves.filter(l => l.status === 'pending').length,
    approved: userLeaves.filter(l => l.status === 'approved').length,
    rejected: userLeaves.filter(l => l.status === 'rejected').length
  });
});

// Leave types data store
let leaveTypes = [
  { id: 1, name: 'Annual Leave', code: 'annual', description: 'Regular annual leave', defaultDays: 20, isActive: true, color: 'blue' },
  { id: 2, name: 'Sick Leave', code: 'sick', description: 'Medical and health-related leave', defaultDays: 10, isActive: true, color: 'red' },
  { id: 3, name: 'Personal Leave', code: 'personal', description: 'Personal and emergency leave', defaultDays: 5, isActive: true, color: 'green' },
  { id: 4, name: 'Maternity Leave', code: 'maternity', description: 'Maternity and pregnancy leave', defaultDays: 90, isActive: true, color: 'purple' },
  { id: 5, name: 'Paternity Leave', code: 'paternity', description: 'Paternity and fatherhood leave', defaultDays: 14, isActive: true, color: 'indigo' }
];

// Leave types routes
app.get('/api/leave-types', auth, (req, res) => {
  res.json(leaveTypes.filter(lt => lt.isActive));
});

// Add new leave type (admin only)
app.post('/api/leave-types', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create leave types' });
  }
  
  const { name, code, description, defaultDays, color } = req.body;
  
  if (!name || !code || !defaultDays) {
    return res.status(400).json({ message: 'Name, code, and default days are required' });
  }
  
  // Check if code already exists
  const existingType = leaveTypes.find(lt => lt.code === code);
  if (existingType) {
    return res.status(400).json({ message: 'Leave type code already exists' });
  }
  
  const newLeaveType = {
    id: Date.now(),
    name,
    code: code.toLowerCase(),
    description: description || '',
    defaultDays: parseInt(defaultDays),
    isActive: true,
    color: color || 'blue'
  };
  
  leaveTypes.push(newLeaveType);
  res.status(201).json(newLeaveType);
});

// Update leave type (admin only)
app.put('/api/leave-types/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update leave types' });
  }
  
  const { id } = req.params;
  const { name, code, description, defaultDays, color, isActive } = req.body;
  
  const leaveTypeIndex = leaveTypes.findIndex(lt => lt.id === parseInt(id));
  if (leaveTypeIndex === -1) {
    return res.status(404).json({ message: 'Leave type not found' });
  }
  
  // Check if code already exists (excluding current type)
  const existingType = leaveTypes.find(lt => lt.code === code && lt.id !== parseInt(id));
  if (existingType) {
    return res.status(400).json({ message: 'Leave type code already exists' });
  }
  
  leaveTypes[leaveTypeIndex] = {
    ...leaveTypes[leaveTypeIndex],
    name,
    code: code.toLowerCase(),
    description: description || '',
    defaultDays: parseInt(defaultDays),
    color: color || 'blue',
    isActive: isActive !== undefined ? isActive : leaveTypes[leaveTypeIndex].isActive
  };
  
  res.json({ 
    message: 'Leave type updated successfully',
    leaveType: leaveTypes[leaveTypeIndex]
  });
});

// Departments data store
let departments = [
  { id: 1, name: 'Human Resources', code: 'HR', description: 'Human Resources Department', isActive: true },
  { id: 2, name: 'Information Technology', code: 'IT', description: 'Information Technology Department', isActive: true },
  { id: 3, name: 'Finance', code: 'FIN', description: 'Finance Department', isActive: true },
  { id: 4, name: 'Marketing', code: 'MKT', description: 'Marketing Department', isActive: true }
];

// Department routes
app.get('/api/departments', auth, (req, res) => {
  res.json(departments);
});

// Add new department
app.post('/api/departments', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create departments' });
  }
  
  const { name, code, description } = req.body;
  
  if (!name || !code) {
    return res.status(400).json({ message: 'Name and code are required' });
  }
  
  // Check if code already exists
  const existingDept = departments.find(d => d.code === code.toUpperCase());
  if (existingDept) {
    return res.status(400).json({ message: 'Department code already exists' });
  }
  
  const newDepartment = {
    id: Date.now(),
    name,
    code: code.toUpperCase(),
    description: description || '',
    isActive: true
  };
  
  departments.push(newDepartment);
  res.status(201).json(newDepartment);
});

// Update department
app.put('/api/departments/:id', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update departments' });
  }
  
  const { id } = req.params;
  const { name, code, description, isActive } = req.body;
  
  const deptIndex = departments.findIndex(d => d.id === parseInt(id));
  if (deptIndex === -1) {
    return res.status(404).json({ message: 'Department not found' });
  }
  
  // Check if code already exists (excluding current dept)
  const existingDept = departments.find(d => d.code === code.toUpperCase() && d.id !== parseInt(id));
  if (existingDept) {
    return res.status(400).json({ message: 'Department code already exists' });
  }
  
  departments[deptIndex] = {
    ...departments[deptIndex],
    name,
    code: code.toUpperCase(),
    description: description || '',
    isActive: isActive !== undefined ? isActive : departments[deptIndex].isActive
  };
  
  res.json({ 
    message: 'Department updated successfully',
    department: departments[deptIndex]
  });
});

// Approve/reject leave
app.put('/api/leaves/:id/approve', auth, (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;
  
  const leave = leaves.find(l => l.id === parseInt(id));
  if (!leave) {
    return res.status(404).json({ message: 'Leave request not found' });
  }
  
  // Check if user can approve this leave
  if (req.user.role === 'employee') {
    return res.status(403).json({ message: 'Employees cannot approve leaves' });
  }
  
  if (req.user.role === 'manager') {
    // Managers can only approve their team's leaves
    const teamMember = users.find(u => u.id === leave.employeeId);
    if (!teamMember || teamMember.manager !== req.user.id) {
      return res.status(403).json({ message: 'You can only approve leaves for your team members' });
    }
  }
  
  leave.status = status;
  leave.approvedBy = req.user.id;
  leave.approvedAt = new Date();
  
  // Handle leave balance changes
  const employee = users.find(u => u.id === leave.employeeId);
  if (employee && employee.leaveBalance) {
    const leaveType = leave.leaveType;
    const currentBalance = employee.leaveBalance[leaveType] || 0;
    
    if (status === 'approved') {
      // Deduct leave balance when approved
      employee.leaveBalance[leaveType] = Math.max(0, currentBalance - leave.duration);
    } else if (status === 'rejected' && leave.status === 'approved') {
      // Restore leave balance if changing from approved to rejected
      employee.leaveBalance[leaveType] = currentBalance + leave.duration;
    }
  }
  
  // Create notification for employee
  const approver = users.find(u => u.id === req.user.id);
  const approvalMessage = status === 'approved' 
    ? `Your ${leave.leaveType} leave request has been approved by ${approver?.firstName} ${approver?.lastName}`
    : `Your ${leave.leaveType} leave request has been rejected by ${approver?.firstName} ${approver?.lastName}`;
  
  createNotification(
    leave.employeeId,
    `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    approvalMessage,
    status === 'approved' ? 'success' : 'error',
    leave.id
  );
  
  // Send email notification to employee
  const employee = users.find(u => u.id === leave.employeeId);
  if (employee) {
    if (status === 'approved') {
      sendEmail(
        employee.email,
        'leaveApproved',
        [
          `${employee.firstName} ${employee.lastName}`,
          leave.leaveType,
          leave.duration,
          `${approver?.firstName} ${approver?.lastName}`
        ]
      );
    } else {
      sendEmail(
        employee.email,
        'leaveRejected',
        [
          `${employee.firstName} ${employee.lastName}`,
          leave.leaveType,
          leave.duration,
          `${approver?.firstName} ${approver?.lastName}`,
          rejectionReason || 'No reason provided'
        ]
      );
    }
  }
  
  if (status === 'rejected' && rejectionReason) {
    leave.rejectionReason = rejectionReason;
  }
  
  res.json({ message: `Leave request ${status} successfully`, leave });
});

// Get specific leave
app.get('/api/leaves/:id', auth, (req, res) => {
  const { id } = req.params;
  const leave = leaves.find(l => l.id === parseInt(id));
  
  if (!leave) {
    return res.status(404).json({ message: 'Leave request not found' });
  }
  
  // Check access permissions
  if (req.user.role === 'employee' && leave.employeeId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(leave);
});

// Notifications data store
let notifications = [];

// Notification routes
app.get('/api/notifications', auth, (req, res) => {
  let userNotifications;
  
  if (req.user.role === 'employee') {
    // Employees see their own notifications
    userNotifications = notifications.filter(n => n.userId === req.user.id);
  } else if (req.user.role === 'manager') {
    // Managers see notifications for their team
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userNotifications = notifications.filter(n => 
      n.userId === req.user.id || teamMemberIds.includes(n.userId)
    );
  } else {
    // Admins see all notifications
    userNotifications = notifications;
  }
  
  res.json(userNotifications);
});

// Mark notification as read
app.put('/api/notifications/:id/read', auth, (req, res) => {
  const { id } = req.params;
  const notification = notifications.find(n => n.id === parseInt(id));
  
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  
  // Check if user can read this notification
  if (req.user.role === 'employee' && notification.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  notification.isRead = true;
  res.json({ message: 'Notification marked as read', notification });
});

// Helper function to create notifications
const createNotification = (userId, title, message, type = 'info', relatedId = null) => {
  const notification = {
    id: Date.now() + Math.random(),
    userId,
    title,
    message,
    type,
    relatedId,
    isRead: false,
    createdAt: new Date()
  };
  
  notifications.push(notification);
  return notification;
};

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Demo users:`);
  console.log(`Admin: admin@company.com / password123`);
  console.log(`Manager: manager@company.com / password123`);
  console.log(`Employee: employee@company.com / password123`);
}); 