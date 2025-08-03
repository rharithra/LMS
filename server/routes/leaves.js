const express = require('express');
const { body, validationResult } = require('express-validator');
const Leave = require('../models/Leave');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/leaves
// @desc    Submit a new leave request
// @access  Private
router.post('/', [
  auth,
  body('leaveType').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'])
    .withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Start date is required'),
  body('endDate').isISO8601().withMessage('End date is required'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('duration').isNumeric().withMessage('Duration must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason, duration, isHalfDay, halfDayType } = req.body;

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot submit leave for past dates' });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await Leave.find({
      employee: req.user._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ]
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({ message: 'Leave request overlaps with existing approved or pending leave' });
    }

    // Check leave balance
    const user = await User.findById(req.user._id);
    const leaveBalance = user.leaveBalance[leaveType];
    
    if (leaveBalance < duration) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. Available: ${leaveBalance} days` 
      });
    }

    // Create leave request
    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      duration,
      reason,
      isHalfDay,
      halfDayType
    });

    await leave.save();

    // Populate employee details for response
    await leave.populate('employee', 'firstName lastName email employeeId');

    res.status(201).json({
      message: 'Leave request submitted successfully',
      leave
    });
  } catch (error) {
    console.error('Submit leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaves
// @desc    Get all leave requests (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, leaveType, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by leave type
    if (leaveType) {
      query.leaveType = leaveType;
    }

    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employee = req.user._id;
    } else if (req.user.role === 'manager') {
      // Get employees managed by this manager
      const managedEmployees = await User.find({ manager: req.user._id }).select('_id');
      const employeeIds = managedEmployees.map(emp => emp._id);
      query.employee = { $in: employeeIds };
    }
    // Admin can see all leaves

    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email employeeId')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Leave.countDocuments(query);

    res.json({
      leaves,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leaves/:id
// @desc    Get specific leave request
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'firstName lastName email employeeId department')
      .populate('approvedBy', 'firstName lastName')
      .populate('comments.user', 'firstName lastName');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && leave.employee._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(leave);
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve or reject leave request
// @access  Private (Managers and Admins)
router.put('/:id/approve', [
  auth,
  authorize('manager', 'admin'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('rejectionReason').optional().notEmpty().withMessage('Rejection reason is required when rejecting')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, rejectionReason } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    // Check if user can approve this leave
    if (req.user.role === 'manager') {
      const managedEmployees = await User.find({ manager: req.user._id }).select('_id');
      const employeeIds = managedEmployees.map(emp => emp._id.toString());
      
      if (!employeeIds.includes(leave.employee._id.toString())) {
        return res.status(403).json({ message: 'You can only approve leaves for your direct reports' });
      }
    }

    // Update leave status
    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();

    if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
      }
      leave.rejectionReason = rejectionReason;
    } else if (status === 'approved') {
      // Update leave balance
      const user = await User.findById(leave.employee._id);
      const leaveType = leave.leaveType;
      
      if (user.leaveBalance[leaveType] < leave.duration) {
        return res.status(400).json({ 
          message: `Insufficient ${leaveType} leave balance for approval` 
        });
      }

      user.leaveBalance[leaveType] -= leave.duration;
      await user.save();
    }

    await leave.save();

    res.json({
      message: `Leave request ${status} successfully`,
      leave
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leaves/:id
// @desc    Update leave request (only pending requests)
// @access  Private
router.put('/:id', [
  auth,
  body('reason').optional().notEmpty().withMessage('Reason cannot be empty'),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow updates for pending requests
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update processed leave request' });
    }

    // Only allow employee to update their own leave
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields
    const { reason, startDate, endDate } = req.body;
    if (reason) leave.reason = reason;
    if (startDate) leave.startDate = new Date(startDate);
    if (endDate) leave.endDate = new Date(endDate);

    // Recalculate duration if dates changed
    if (startDate || endDate) {
      const start = leave.startDate;
      const end = leave.endDate;
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leave.duration = diffDays;
    }

    await leave.save();

    res.json({
      message: 'Leave request updated successfully',
      leave
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Cancel leave request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Only allow cancellation of pending requests
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel processed leave request' });
    }

    // Only allow employee to cancel their own leave
    if (leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leaves/:id/comments
// @desc    Add comment to leave request
// @access  Private
router.post('/:id/comments', [
  auth,
  body('comment').notEmpty().withMessage('Comment is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check access permissions
    if (req.user.role === 'employee' && leave.employee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    leave.comments.push({
      user: req.user._id,
      comment: req.body.comment
    });

    await leave.save();

    res.json({
      message: 'Comment added successfully',
      leave
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 