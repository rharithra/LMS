const express = require('express');
const { body, validationResult } = require('express-validator');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/departments
// @desc    Get all departments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'firstName lastName email')
      .sort({ name: 1 });

    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/:id
// @desc    Get specific department
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'firstName lastName email');

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.json(department);
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/departments
// @desc    Create new department
// @access  Private (Admin only)
router.post('/', [
  auth,
  authorize('admin'),
  body('name').notEmpty().withMessage('Department name is required'),
  body('code').notEmpty().withMessage('Department code is required'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, head, leavePolicies } = req.body;

    // Check if department already exists
    const existingDepartment = await Department.findOne({
      $or: [{ name }, { code }]
    });

    if (existingDepartment) {
      return res.status(400).json({ 
        message: 'Department with this name or code already exists' 
      });
    }

    const department = new Department({
      name,
      code: code.toUpperCase(),
      description,
      head,
      leavePolicies
    });

    await department.save();

    res.status(201).json({
      message: 'Department created successfully',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/departments/:id
// @desc    Update department
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  authorize('admin'),
  body('name').optional().notEmpty().withMessage('Department name cannot be empty'),
  body('code').optional().notEmpty().withMessage('Department code cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const { name, code, description, head, leavePolicies, isActive } = req.body;

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (head !== undefined) department.head = head;
    if (leavePolicies) department.leavePolicies = { ...department.leavePolicies, ...leavePolicies };
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    res.json({
      message: 'Department updated successfully',
      department
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/departments/:id
// @desc    Delete department
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if department has employees
    const employeeCount = await User.countDocuments({ department: req.params.id });
    
    if (employeeCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. It has ${employeeCount} employee(s) assigned.` 
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/departments/:id/employees
// @desc    Get employees in department
// @access  Private
router.get('/:id/employees', auth, async (req, res) => {
  try {
    const employees = await User.find({ department: req.params.id })
      .select('-password')
      .populate('manager', 'firstName lastName email')
      .sort({ firstName: 1, lastName: 1 });

    res.json(employees);
  } catch (error) {
    console.error('Get department employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 