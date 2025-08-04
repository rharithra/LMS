// Load environment variables
require('dotenv').config();

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
const transporter = nodemailer.createTransport({
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

// Payroll data store
let payrolls = [];
let salaryStructures = [
  {
    id: 1,
    name: 'Basic Salary Structure',
    basicSalary: 50000,
    hra: 20000,
    da: 15000,
    ta: 5000,
    pf: 6000,
    tax: 8000,
    isActive: true
  }
];

let allowances = [
  { id: 1, name: 'House Rent Allowance', code: 'HRA', percentage: 40, isActive: true },
  { id: 2, name: 'Dearness Allowance', code: 'DA', percentage: 30, isActive: true },
  { id: 3, name: 'Transport Allowance', code: 'TA', percentage: 10, isActive: true },
  { id: 4, name: 'Medical Allowance', code: 'MA', percentage: 5, isActive: true }
];

let deductions = [
  { id: 1, name: 'Provident Fund', code: 'PF', percentage: 12, isActive: true },
  { id: 2, name: 'Professional Tax', code: 'PT', amount: 200, isActive: true },
  { id: 3, name: 'Income Tax', code: 'IT', percentage: 10, isActive: true }
];

// Update users with salary information
users.forEach((user, index) => {
  if (!user.salary) {
    // Different salary structures for different employees
    const salaryStructures = [
      {
        basicSalary: 50000,
        hra: 20000,
        da: 15000,
        ta: 5000,
        pf: 6000,
        tax: 8000,
        performanceIncentive: 0,
        specialAllowance: 5000,
        medicalAllowance: 3000,
        conveyanceAllowance: 2000,
        foodAllowance: 1500,
        otherAllowances: 0,
        netSalary: 75000
      },
      {
        basicSalary: 75000,
        hra: 30000,
        da: 22500,
        ta: 7500,
        pf: 9000,
        tax: 12000,
        performanceIncentive: 0,
        specialAllowance: 8000,
        medicalAllowance: 4000,
        conveyanceAllowance: 3000,
        foodAllowance: 2000,
        otherAllowances: 0,
        netSalary: 112500
      },
      {
        basicSalary: 100000,
        hra: 40000,
        da: 30000,
        ta: 10000,
        pf: 12000,
        tax: 16000,
        performanceIncentive: 0,
        specialAllowance: 12000,
        medicalAllowance: 5000,
        conveyanceAllowance: 4000,
        foodAllowance: 2500,
        otherAllowances: 0,
        netSalary: 150000
      }
    ];
    
    user.salary = salaryStructures[index % salaryStructures.length];
  }
  if (!user.payrollInfo) {
    user.payrollInfo = {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCDE1234F'
    };
  }
});

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
  
  // Assign salary structure based on role
  const salaryStructures = [
    {
      basicSalary: 50000,
      hra: 20000,
      da: 15000,
      ta: 5000,
      pf: 6000,
      tax: 8000,
      performanceIncentive: 0,
      specialAllowance: 5000,
      medicalAllowance: 3000,
      conveyanceAllowance: 2000,
      foodAllowance: 1500,
      otherAllowances: 0,
      netSalary: 75000
    },
    {
      basicSalary: 75000,
      hra: 30000,
      da: 22500,
      ta: 7500,
      pf: 9000,
      tax: 12000,
      performanceIncentive: 0,
      specialAllowance: 8000,
      medicalAllowance: 4000,
      conveyanceAllowance: 3000,
      foodAllowance: 2000,
      otherAllowances: 0,
      netSalary: 112500
    },
    {
      basicSalary: 100000,
      hra: 40000,
      da: 30000,
      ta: 10000,
      pf: 12000,
      tax: 16000,
      performanceIncentive: 0,
      specialAllowance: 12000,
      medicalAllowance: 5000,
      conveyanceAllowance: 4000,
      foodAllowance: 2500,
      otherAllowances: 0,
      netSalary: 150000
    }
  ];

  const newUser = {
    id: Date.now(),
    firstName,
    lastName,
    email,
    employeeId,
    role,
    department,
    manager: manager || null,
    leaveBalance: { annual: 20, sick: 10, personal: 5 },
    salary: salaryStructures[users.length % salaryStructures.length],
    payrollInfo: {
      bankName: 'HDFC Bank',
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCDE1234F'
    }
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
  const employeeForEmail = users.find(u => u.id === leave.employeeId);
  if (employeeForEmail) {
    if (status === 'approved') {
      sendEmail(
        employeeForEmail.email,
        'leaveApproved',
        [
          `${employeeForEmail.firstName} ${employeeForEmail.lastName}`,
          leave.leaveType,
          leave.duration,
          `${approver?.firstName} ${approver?.lastName}`
        ]
      );
    } else {
      sendEmail(
        employeeForEmail.email,
        'leaveRejected',
        [
          `${employeeForEmail.firstName} ${employeeForEmail.lastName}`,
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

// Payroll routes
app.get('/api/payroll', auth, (req, res) => {
  let userPayrolls;
  
  if (req.user.role === 'employee') {
    // Employees see only their own payroll
    userPayrolls = payrolls.filter(p => p.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    // Managers see their team's payroll
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userPayrolls = payrolls.filter(p => teamMemberIds.includes(p.employeeId));
  } else {
    // Admins see all payroll
    userPayrolls = payrolls;
  }
  
  // Add employee information to each payroll
  const payrollsWithEmployee = userPayrolls.map(payroll => {
    const employee = users.find(u => u.id === payroll.employeeId);
    return {
      ...payroll,
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
    payrolls: payrollsWithEmployee,
    pagination: { current: 1, pages: 1, total: payrollsWithEmployee.length }
  });
});

// Generate payroll for a specific month
app.post('/api/payroll/generate', auth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const { employeeId, month, year, workingDays = 22 } = req.body;
  
  const employee = users.find(u => u.id === parseInt(employeeId));
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  
  // Check if payroll already exists for this month
  const existingPayroll = payrolls.find(p => 
    p.employeeId === parseInt(employeeId) && 
    p.month === parseInt(month) && 
    p.year === parseInt(year)
  );
  
  if (existingPayroll) {
    return res.status(400).json({ message: 'Payroll already exists for this month' });
  }
  
  // Calculate leave deductions with detailed breakdown
  const monthLeaves = leaves.filter(l => 
    l.employeeId === parseInt(employeeId) && 
    l.status === 'approved' &&
    new Date(l.startDate).getMonth() === parseInt(month) - 1 &&
    new Date(l.startDate).getFullYear() === parseInt(year)
  );
  
  // Calculate total leave days and breakdown by leave type
  const leaveDays = monthLeaves.reduce((total, leave) => total + leave.duration, 0);
  const leaveBreakdown = monthLeaves.reduce((acc, leave) => {
    const leaveType = leave.leaveType || 'Unknown';
    acc[leaveType] = (acc[leaveType] || 0) + leave.duration;
    return acc;
  }, {});
  
  const actualWorkingDays = workingDays - leaveDays;
  
  // Calculate salary components
  const basicSalary = employee.salary.basicSalary;
  const hra = employee.salary.hra;
  const da = employee.salary.da;
  const ta = employee.salary.ta;
  const performanceIncentive = employee.salary.performanceIncentive || 0;
  const specialAllowance = employee.salary.specialAllowance || 0;
  const medicalAllowance = employee.salary.medicalAllowance || 0;
  const conveyanceAllowance = employee.salary.conveyanceAllowance || 0;
  const foodAllowance = employee.salary.foodAllowance || 0;
  const otherAllowances = employee.salary.otherAllowances || 0;
  
  // Calculate allowances
  const totalAllowances = hra + da + ta + performanceIncentive + specialAllowance + 
                         medicalAllowance + conveyanceAllowance + foodAllowance + otherAllowances;
  
  // Calculate deductions
  const pf = employee.salary.pf;
  const tax = employee.salary.tax;
  const totalDeductions = pf + tax;
  
  // Calculate gross and net salary
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;
  
  // Calculate per day salary and deductions
  const perDaySalary = grossSalary / workingDays;
  const leaveDeduction = leaveDays * perDaySalary;
  const finalNetSalary = netSalary - leaveDeduction;
  
  const newPayroll = {
    id: Date.now(),
    employeeId: parseInt(employeeId),
    month: parseInt(month),
    year: parseInt(year),
    workingDays,
    actualWorkingDays,
    leaveDays,
    leaveBreakdown,
    monthLeaves: monthLeaves.map(leave => ({
      id: leave.id,
      startDate: leave.startDate,
      endDate: leave.endDate,
      duration: leave.duration,
      leaveType: leave.leaveType,
      reason: leave.reason
    })),
    salary: {
      basicSalary,
      hra,
      da,
      ta,
      performanceIncentive,
      specialAllowance,
      medicalAllowance,
      conveyanceAllowance,
      foodAllowance,
      otherAllowances,
      totalAllowances,
      pf,
      tax,
      totalDeductions,
      grossSalary,
      netSalary,
      leaveDeduction,
      finalNetSalary
    },
    status: 'generated',
    generatedBy: req.user.id,
    generatedAt: new Date()
  };
  
  payrolls.push(newPayroll);
  
  res.status(201).json({ 
    message: 'Payroll generated successfully', 
    payroll: newPayroll 
  });
});

// Get payroll by ID
app.get('/api/payroll/:id', auth, (req, res) => {
  const { id } = req.params;
  const payroll = payrolls.find(p => p.id === parseInt(id));
  
  if (!payroll) {
    return res.status(404).json({ message: 'Payroll not found' });
  }
  
  // Check access permissions
  if (req.user.role === 'employee' && payroll.employeeId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  if (req.user.role === 'manager') {
    const teamMember = users.find(u => u.id === payroll.employeeId);
    if (!teamMember || teamMember.manager !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
  }
  
  // Add employee information
  const employee = users.find(u => u.id === payroll.employeeId);
  const payrollWithEmployee = {
    ...payroll,
    employee: employee ? {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      employeeId: employee.employeeId,
      department: employee.department
    } : null
  };
  
  res.json(payrollWithEmployee);
});

// Get salary structures
app.get('/api/salary-structures', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(salaryStructures);
});

// Get allowances
app.get('/api/allowances', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(allowances);
});

// Get deductions
app.get('/api/deductions', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  res.json(deductions);
});

// Update employee salary
app.put('/api/users/:id/salary', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update salary' });
  }
  
  const { id } = req.params;
  const { 
    basicSalary, hra, da, ta, pf, tax, 
    performanceIncentive, specialAllowance, medicalAllowance,
    conveyanceAllowance, foodAllowance, otherAllowances 
  } = req.body;
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Calculate total allowances and deductions
  const totalAllowances = (hra || 0) + (da || 0) + (ta || 0) + 
                         (performanceIncentive || 0) + (specialAllowance || 0) + 
                         (medicalAllowance || 0) + (conveyanceAllowance || 0) + 
                         (foodAllowance || 0) + (otherAllowances || 0);
  const totalDeductions = (pf || 0) + (tax || 0);
  const netSalary = (basicSalary || 0) + totalAllowances - totalDeductions;
  
  users[userIndex].salary = {
    basicSalary: basicSalary || users[userIndex].salary.basicSalary,
    hra: hra || users[userIndex].salary.hra,
    da: da || users[userIndex].salary.da,
    ta: ta || users[userIndex].salary.ta,
    pf: pf || users[userIndex].salary.pf,
    tax: tax || users[userIndex].salary.tax,
    performanceIncentive: performanceIncentive || users[userIndex].salary.performanceIncentive || 0,
    specialAllowance: specialAllowance || users[userIndex].salary.specialAllowance || 0,
    medicalAllowance: medicalAllowance || users[userIndex].salary.medicalAllowance || 0,
    conveyanceAllowance: conveyanceAllowance || users[userIndex].salary.conveyanceAllowance || 0,
    foodAllowance: foodAllowance || users[userIndex].salary.foodAllowance || 0,
    otherAllowances: otherAllowances || users[userIndex].salary.otherAllowances || 0,
    netSalary
  };
  
  res.json({ 
    message: 'Salary updated successfully',
    salary: users[userIndex].salary
  });
});

// Update employee payroll info
app.put('/api/users/:id/payroll-info', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update payroll info' });
  }
  
  const { id } = req.params;
  const { bankName, accountNumber, ifscCode, panNumber } = req.body;
  
  const userIndex = users.findIndex(u => u.id === parseInt(id));
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  users[userIndex].payrollInfo = {
    bankName: bankName || users[userIndex].payrollInfo.bankName,
    accountNumber: accountNumber || users[userIndex].payrollInfo.accountNumber,
    ifscCode: ifscCode || users[userIndex].payrollInfo.ifscCode,
    panNumber: panNumber || users[userIndex].payrollInfo.panNumber
  };
  
  res.json({ 
    message: 'Payroll info updated successfully',
    payrollInfo: users[userIndex].payrollInfo
  });
});

// Get payroll statistics
app.get('/api/payroll/stats', auth, (req, res) => {
  let userPayrolls;
  
  if (req.user.role === 'employee') {
    userPayrolls = payrolls.filter(p => p.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userPayrolls = payrolls.filter(p => teamMemberIds.includes(p.employeeId));
  } else {
    userPayrolls = payrolls;
  }
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const currentMonthPayrolls = userPayrolls.filter(p => 
    p.year === currentYear && p.month === currentMonth
  );
  
  const totalSalaryPaid = userPayrolls.reduce((total, p) => total + p.salary.finalNetSalary, 0);
  const currentMonthSalary = currentMonthPayrolls.reduce((total, p) => total + p.salary.finalNetSalary, 0);
  
  res.json({
    totalPayrolls: userPayrolls.length,
    currentMonthPayrolls: currentMonthPayrolls.length,
    totalSalaryPaid,
    currentMonthSalary,
    averageSalary: userPayrolls.length > 0 ? totalSalaryPaid / userPayrolls.length : 0
  });
});

// Performance Management data stores
let kpis = [
  {
    id: 1,
    name: 'Sales Target Achievement',
    description: 'Percentage of sales target achieved',
    category: 'Sales',
    weightage: 30,
    isActive: true
  },
  {
    id: 2,
    name: 'Customer Satisfaction',
    description: 'Customer satisfaction score',
    category: 'Customer Service',
    weightage: 25,
    isActive: true
  },
  {
    id: 3,
    name: 'Project Completion',
    description: 'On-time project delivery rate',
    category: 'Project Management',
    weightage: 20,
    isActive: true
  },
  {
    id: 4,
    name: 'Team Collaboration',
    description: 'Peer feedback and teamwork',
    category: 'Leadership',
    weightage: 15,
    isActive: true
  },
  {
    id: 5,
    name: 'Innovation & Learning',
    description: 'New skills acquired and innovations',
    category: 'Personal Development',
    weightage: 10,
    isActive: true
  }
];

let performanceGoals = [
  {
    id: 1,
    employeeId: 1,
    title: 'Increase Sales by 20%',
    description: 'Achieve 20% growth in Q4 sales',
    category: 'Sales',
    targetValue: 20,
    currentValue: 15,
    unit: 'percentage',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    status: 'in-progress',
    priority: 'high'
  }
];

let performanceReviews = [
  {
    id: 1,
    employeeId: 1,
    reviewerId: 2,
    reviewPeriod: 'Q1-2024',
    reviewDate: '2024-03-31',
    overallRating: 4.2,
    kpiScores: [
      { kpiId: 1, score: 4.5, weightage: 30 },
      { kpiId: 2, score: 4.0, weightage: 25 },
      { kpiId: 3, score: 4.2, weightage: 20 },
      { kpiId: 4, score: 4.1, weightage: 15 },
      { kpiId: 5, score: 4.0, weightage: 10 }
    ],
    strengths: ['Excellent sales performance', 'Great team player'],
    areasOfImprovement: ['Time management', 'Documentation'],
    recommendations: ['Consider for promotion', 'Provide leadership training'],
    performanceIncentive: 5000,
    status: 'completed'
  }
];

let promotions = [
  {
    id: 1,
    employeeId: 1,
    fromPosition: 'Sales Executive',
    toPosition: 'Senior Sales Executive',
    effectiveDate: '2024-04-01',
    salaryIncrease: 10000,
    reason: 'Outstanding performance in Q1 2024',
    approvedBy: 3,
    status: 'approved'
  }
];

// Performance calculation function
const calculatePerformanceIncentive = (employeeId, reviewPeriod) => {
  const review = performanceReviews.find(r => 
    r.employeeId === employeeId && r.reviewPeriod === reviewPeriod
  );
  
  if (!review) return 0;
  
  // Calculate weighted average score
  const totalWeightage = review.kpiScores.reduce((sum, kpi) => sum + kpi.weightage, 0);
  const weightedScore = review.kpiScores.reduce((sum, kpi) => 
    sum + (kpi.score * kpi.weightage), 0
  ) / totalWeightage;
  
  // Performance incentive calculation based on score
  let incentive = 0;
  if (weightedScore >= 4.5) {
    incentive = 10000; // Excellent
  } else if (weightedScore >= 4.0) {
    incentive = 7500; // Good
  } else if (weightedScore >= 3.5) {
    incentive = 5000; // Average
  } else if (weightedScore >= 3.0) {
    incentive = 2500; // Below Average
  }
  
  return incentive;
};

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Performance Management APIs

// Test endpoint to check if API is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Get KPIs
app.get('/api/kpis', auth, (req, res) => {
  res.json(kpis.filter(kpi => kpi.isActive));
});

// Add KPI
app.post('/api/kpis', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create KPIs' });
  }
  
  const { name, description, category, weightage } = req.body;
  
  if (!name || !description || !category || !weightage) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newKpi = {
    id: Date.now(),
    name,
    description,
    category,
    weightage: parseInt(weightage),
    isActive: true
  };
  
  kpis.push(newKpi);
  res.status(201).json(newKpi);
});

// Get performance goals
app.get('/api/performance-goals', auth, (req, res) => {
  let userGoals;
  
  if (req.user.role === 'employee') {
    userGoals = performanceGoals.filter(g => g.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userGoals = performanceGoals.filter(g => teamMemberIds.includes(g.employeeId));
  } else {
    userGoals = performanceGoals;
  }
  
  // Add employee information
  const goalsWithEmployee = userGoals.map(goal => {
    const employee = users.find(u => u.id === goal.employeeId);
    return {
      ...goal,
      employee: employee ? {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email
      } : null
    };
  });
  
  res.json(goalsWithEmployee);
});

// Add performance goal
app.post('/api/performance-goals', auth, (req, res) => {
  console.log('Performance goal endpoint hit');
  console.log('User:', req.user);
  
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    console.log('Access denied - user role:', req.user.role);
    return res.status(403).json({ message: 'Access denied' });
  }
  
  console.log('Received goal data:', req.body);
  
  const { employeeId, title, description, category, targetValue, currentValue, unit, startDate, endDate, priority } = req.body;
  
  if (!employeeId || !title || !targetValue || !startDate || !endDate) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  
  try {
    const newGoal = {
      id: Date.now(),
      employeeId: parseInt(employeeId),
      title,
      description: description || '',
      category: category || '',
      targetValue: parseFloat(targetValue),
      currentValue: parseFloat(currentValue) || 0,
      unit: unit || '',
      startDate,
      endDate,
      status: 'in-progress',
      priority: priority || 'medium'
    };
    
    performanceGoals.push(newGoal);
    console.log('Goal created successfully:', newGoal);
    
    // Create notification for the employee
    const employee = users.find(u => u.id === parseInt(employeeId));
    if (employee) {
      createNotification(
        parseInt(employeeId),
        'New Performance Goal Assigned',
        `A new performance goal "${title}" has been assigned to you. Target: ${targetValue} ${unit}`,
        'goal',
        newGoal.id
      );
    }
    
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update performance goal progress
app.put('/api/performance-goals/:id', auth, (req, res) => {
  const { id } = req.params;
  const { currentValue, status } = req.body;
  
  const goal = performanceGoals.find(g => g.id === parseInt(id));
  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // Only the assigned employee can update their own goal
  if (goal.employeeId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  goal.currentValue = parseFloat(currentValue) || goal.currentValue;
  goal.status = status || goal.status;
  
  // Auto-complete if target is reached
  if (goal.currentValue >= goal.targetValue && goal.status !== 'completed') {
    goal.status = 'completed';
  }
  
  res.json(goal);
});

// Get performance reviews
app.get('/api/performance-reviews', auth, (req, res) => {
  let userReviews;
  
  if (req.user.role === 'employee') {
    userReviews = performanceReviews.filter(r => r.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userReviews = performanceReviews.filter(r => teamMemberIds.includes(r.employeeId));
  } else {
    userReviews = performanceReviews;
  }
  
  // Add employee and reviewer information
  const reviewsWithDetails = userReviews.map(review => {
    const employee = users.find(u => u.id === review.employeeId);
    const reviewer = users.find(u => u.id === review.reviewerId);
    return {
      ...review,
      employee: employee ? {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email
      } : null,
      reviewer: reviewer ? {
        id: reviewer.id,
        firstName: reviewer.firstName,
        lastName: reviewer.lastName,
        email: reviewer.email
      } : null
    };
  });
  
  res.json(reviewsWithDetails);
});

// Add performance review
app.post('/api/performance-reviews', auth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }
  
  const { 
    employeeId, reviewPeriod, reviewDate, kpiScores, 
    strengths, areasOfImprovement, recommendations 
  } = req.body;
  
  if (!employeeId || !reviewPeriod || !reviewDate || !kpiScores) {
    return res.status(400).json({ message: 'Required fields missing' });
  }
  
  // Calculate overall rating
  const totalWeightage = kpiScores.reduce((sum, kpi) => sum + kpi.weightage, 0);
  const overallRating = kpiScores.reduce((sum, kpi) => 
    sum + (kpi.score * kpi.weightage), 0
  ) / totalWeightage;
  
  // Calculate performance incentive
  const performanceIncentive = calculatePerformanceIncentive(parseInt(employeeId), reviewPeriod);
  
  const newReview = {
    id: Date.now(),
    employeeId: parseInt(employeeId),
    reviewerId: req.user.id,
    reviewPeriod,
    reviewDate,
    overallRating: parseFloat(overallRating.toFixed(1)),
    kpiScores,
    strengths: strengths || [],
    areasOfImprovement: areasOfImprovement || [],
    recommendations: recommendations || [],
    performanceIncentive,
    status: 'completed'
  };
  
  performanceReviews.push(newReview);
  
  // Update employee's performance incentive in salary
  const userIndex = users.findIndex(u => u.id === parseInt(employeeId));
  if (userIndex !== -1) {
    users[userIndex].salary.performanceIncentive = performanceIncentive;
  }
  
  res.status(201).json(newReview);
});

// Get promotions
app.get('/api/promotions', auth, (req, res) => {
  let userPromotions;
  
  if (req.user.role === 'employee') {
    userPromotions = promotions.filter(p => p.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userPromotions = promotions.filter(p => teamMemberIds.includes(p.employeeId));
  } else {
    userPromotions = promotions;
  }
  
  // Add employee information
  const promotionsWithEmployee = userPromotions.map(promotion => {
    const employee = users.find(u => u.id === promotion.employeeId);
    const approver = users.find(u => u.id === promotion.approvedBy);
    return {
      ...promotion,
      employee: employee ? {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email
      } : null,
      approver: approver ? {
        id: approver.id,
        firstName: approver.firstName,
        lastName: approver.lastName,
        email: approver.email
      } : null
    };
  });
  
  res.json(promotionsWithEmployee);
});

// Add promotion
app.post('/api/promotions', auth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create promotions' });
  }
  
  const { employeeId, fromPosition, toPosition, effectiveDate, salaryIncrease, reason } = req.body;
  
  if (!employeeId || !fromPosition || !toPosition || !effectiveDate || !salaryIncrease || !reason) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const newPromotion = {
    id: Date.now(),
    employeeId: parseInt(employeeId),
    fromPosition,
    toPosition,
    effectiveDate,
    salaryIncrease: parseFloat(salaryIncrease),
    reason,
    approvedBy: req.user.id,
    status: 'approved'
  };
  
  promotions.push(newPromotion);
  
  // Update employee's basic salary
  const userIndex = users.findIndex(u => u.id === parseInt(employeeId));
  if (userIndex !== -1) {
    users[userIndex].salary.basicSalary += parseFloat(salaryIncrease);
  }
  
  res.status(201).json(newPromotion);
});

// Get performance statistics
app.get('/api/performance/stats', auth, (req, res) => {
  let userReviews;
  
  if (req.user.role === 'employee') {
    userReviews = performanceReviews.filter(r => r.employeeId === req.user.id);
  } else if (req.user.role === 'manager') {
    const teamMembers = users.filter(u => u.manager === req.user.id);
    const teamMemberIds = teamMembers.map(u => u.id);
    userReviews = performanceReviews.filter(r => teamMemberIds.includes(r.employeeId));
  } else {
    userReviews = performanceReviews;
  }
  
  const stats = {
    totalReviews: userReviews.length,
    averageRating: userReviews.length > 0 ? 
      (userReviews.reduce((sum, r) => sum + r.overallRating, 0) / userReviews.length).toFixed(1) : 0,
    totalIncentives: userReviews.reduce((sum, r) => sum + r.performanceIncentive, 0),
    recentReviews: userReviews.slice(-5)
  };
  
  res.json(stats);
});

// ==================== ATTENDANCE ROUTES ====================

// Get all attendance records (admin only)
app.get('/api/attendance', auth, (req, res) => {
  try {
    const { page = 1, limit = 10, userId, startDate, endDate, status } = req.query;
    
    let query = {};
    
    if (userId) query.userId = parseInt(userId);
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // For now, return empty array as we'll implement with database later
    res.json({
      attendance: [],
      totalPages: 0,
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own attendance
app.get('/api/attendance/my-attendance', auth, (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // For now, return empty array as we'll implement with database later
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check in
app.post('/api/attendance/check-in', auth, (req, res) => {
  try {
    const { method = 'manual', location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // For now, return success response
    res.json({
      message: 'Check-in successful',
      checkInTime: new Date(),
      method,
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check out
app.post('/api/attendance/check-out', auth, (req, res) => {
  try {
    const { method = 'manual', location } = req.body;
    
    // For now, return success response
    res.json({
      message: 'Check-out successful',
      checkOutTime: new Date(),
      method,
      location
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics
app.get('/api/attendance/stats', auth, (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    // For now, return default stats
    res.json({
      totalDays: 0,
      totalHours: 0,
      totalOvertime: 0,
      totalLateMinutes: 0,
      totalEarlyLeaveMinutes: 0,
      present: 0,
      late: 0,
      absent: 0,
      earlyLeave: 0,
      overtime: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly attendance report
app.get('/api/attendance/monthly-report', auth, (req, res) => {
  try {
    const { year, month, userId } = req.query;
    
    // For now, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SHIFT ROUTES ====================

// Get all shifts
app.get('/api/shifts', auth, (req, res) => {
  try {
    const { department, isActive } = req.query;
    
    // Default shifts
    const defaultShifts = [
      {
        id: 1,
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Standard morning shift',
        color: '#3B82F6',
        department: null
      },
      {
        id: 2,
        name: 'Evening Shift',
        startTime: '17:00',
        endTime: '01:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Evening shift',
        color: '#8B5CF6',
        department: null
      },
      {
        id: 3,
        name: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Night shift',
        color: '#1F2937',
        department: null
      }
    ];
    
    let filteredShifts = defaultShifts;
    
    if (isActive !== undefined) {
      filteredShifts = filteredShifts.filter(shift => shift.isActive === (isActive === 'true'));
    }
    
    res.json(filteredShifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single shift
app.get('/api/shifts/:id', auth, (req, res) => {
  try {
    const shiftId = parseInt(req.params.id);
    
    const defaultShifts = [
      {
        id: 1,
        name: 'Morning Shift',
        startTime: '09:00',
        endTime: '17:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Standard morning shift',
        color: '#3B82F6',
        department: null
      },
      {
        id: 2,
        name: 'Evening Shift',
        startTime: '17:00',
        endTime: '01:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Evening shift',
        color: '#8B5CF6',
        department: null
      },
      {
        id: 3,
        name: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        breakTime: 60,
        totalHours: 7,
        isActive: true,
        description: 'Night shift',
        color: '#1F2937',
        department: null
      }
    ];
    
    const shift = defaultShifts.find(s => s.id === shiftId);
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new shift
app.post('/api/shifts', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create shifts' });
    }
    
    const {
      name,
      startTime,
      endTime,
      breakTime,
      description,
      color,
      department
    } = req.body;
    
    if (!name || !startTime || !endTime) {
      return res.status(400).json({ message: 'Name, start time, and end time are required' });
    }
    
    const newShift = {
      id: Date.now(),
      name,
      startTime,
      endTime,
      breakTime: breakTime || 60,
      totalHours: 8, // Calculate this based on start/end time
      isActive: true,
      description: description || '',
      color: color || '#3B82F6',
      department: department || null
    };
    
    res.status(201).json(newShift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update shift
app.put('/api/shifts/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update shifts' });
    }
    
    const shiftId = parseInt(req.params.id);
    const {
      name,
      startTime,
      endTime,
      breakTime,
      description,
      color,
      department,
      isActive
    } = req.body;
    
    // For now, return success response
    res.json({
      id: shiftId,
      name: name || 'Updated Shift',
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      breakTime: breakTime || 60,
      totalHours: 8,
      isActive: isActive !== undefined ? isActive : true,
      description: description || '',
      color: color || '#3B82F6',
      department: department || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete shift
app.delete('/api/shifts/:id', auth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete shifts' });
    }
    
    const shiftId = parseInt(req.params.id);
    
    // For now, return success response
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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