const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Department = require('../models/Department');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (filtered by role)
// @access  Private (Managers and Admins)
router.get('/', [auth, authorize('manager', 'admin')], async (req, res) => {
  try {
    const { department, role, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by department
    if (department) {
      query.department = department;
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Role-based filtering
    if (req.user.role === 'manager') {
      // Managers can only see their direct reports
      query.manager = req.user._id;
    }
    // Admins can see all users

    const users = await User.find(query)
      .select('-password')
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get specific user
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private
router.put('/:id', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('position').optional().notEmpty().withMessage('Position cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    const { firstName, lastName, email, position, department, manager, role, isActive } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (position) user.position = position;
    
    // Only admins can update these fields
    if (req.user.role === 'admin') {
      if (department) user.department = department;
      if (manager) user.manager = manager;
      if (role) user.role = role;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/:id/leave-balance
// @desc    Update user leave balance
// @access  Private (Managers and Admins)
router.put('/:id/leave-balance', [
  auth,
  authorize('manager', 'admin'),
  body('leaveBalance').isObject().withMessage('Leave balance is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user can update this employee's balance
    if (req.user.role === 'manager') {
      const managedEmployees = await User.find({ manager: req.user._id }).select('_id');
      const employeeIds = managedEmployees.map(emp => emp._id.toString());
      
      if (!employeeIds.includes(req.params.id)) {
        return res.status(403).json({ message: 'You can only update leave balance for your direct reports' });
      }
    }

    const { leaveBalance } = req.body;
    user.leaveBalance = { ...user.leaveBalance, ...leaveBalance };
    await user.save();

    res.json({
      message: 'Leave balance updated successfully',
      leaveBalance: user.leaveBalance
    });
  } catch (error) {
    console.error('Update leave balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/me/profile
// @desc    Get current user's profile
// @access  Private
router.get('/me/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName email');

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/me/profile
// @desc    Update current user's profile
// @access  Private
router.put('/me/profile', [
  auth,
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user._id);

    const { firstName, lastName, email } = req.body;
    
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/me/team
// @desc    Get current user's team (for managers)
// @access  Private
router.get('/me/team', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied. Only managers can view their team.' });
    }

    const team = await User.find({ manager: req.user._id })
      .select('-password')
      .populate('department', 'name code')
      .sort({ firstName: 1, lastName: 1 });

    res.json(team);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/departments/:departmentId
// @desc    Get users by department
// @access  Private (Managers and Admins)
router.get('/departments/:departmentId', [auth, authorize('manager', 'admin')], async (req, res) => {
  try {
    const users = await User.find({ department: req.params.departmentId })
      .select('-password')
      .populate('department', 'name code')
      .populate('manager', 'firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get department users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 