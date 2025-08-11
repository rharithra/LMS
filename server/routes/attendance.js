const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const User = require('../models/User');

// Get all attendance records (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userId, startDate, endDate, status } = req.query;
    
    let query = {};
    
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId')
      .populate('shift', 'name startTime endTime')
      .populate('approvedBy', 'name')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Attendance.countDocuments(query);
    
    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own attendance
router.get('/my-attendance', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { userId: req.user.id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const attendance = await Attendance.find(query)
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check in
router.post('/check-in', auth, async (req, res) => {
  try {
    const { method = 'manual', location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    
    // Get user's default shift
    const user = await User.findById(req.user.id).populate('department');
    const defaultShift = await Shift.findOne({ 
      department: user.department?._id,
      isActive: true 
    }) || await Shift.findOne({ isActive: true });
    
    if (!defaultShift) {
      return res.status(400).json({ message: 'No active shift found' });
    }
    
    const attendance = new Attendance({
      userId: req.user.id,
      date: today,
      checkIn: {
        time: new Date(),
        method,
        location
      },
      shift: defaultShift._id
    });
    
    await attendance.save();
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check out
router.post('/check-out', auth, async (req, res) => {
  try {
    const { method = 'manual', location } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      userId: req.user.id,
      date: today
    });
    
    if (!attendance) {
      return res.status(400).json({ message: 'No check-in record found for today' });
    }
    
    if (attendance.checkOut.time) {
      return res.status(400).json({ message: 'Already checked out today' });
    }
    
    attendance.checkOut = {
      time: new Date(),
      method,
      location
    };
    
    await attendance.save();
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          totalHours: { $sum: '$totalHours' },
          totalOvertime: { $sum: '$overtimeHours' },
          totalLateMinutes: { $sum: '$lateMinutes' },
          totalEarlyLeaveMinutes: { $sum: '$earlyLeaveMinutes' },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          earlyLeave: { $sum: { $cond: [{ $eq: ['$status', 'early_leave'] }, 1, 0] } },
          overtime: { $sum: { $cond: [{ $eq: ['$status', 'overtime'] }, 1, 0] } }
        }
      }
    ]);
    
    res.json(stats[0] || {
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
router.get('/monthly-report', auth, async (req, res) => {
  try {
    const { year, month, userId } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    let query = {
      date: { $gte: startDate, $lte: endDate }
    };
    
    if (userId) query.userId = userId;
    
    const attendance = await Attendance.find(query)
      .populate('userId', 'name email employeeId')
      .populate('shift', 'name startTime endTime')
      .sort({ date: 1 });
    
    // Group by user
    const userReports = {};
    attendance.forEach(record => {
      const userId = record.userId._id.toString();
      if (!userReports[userId]) {
        userReports[userId] = {
          user: record.userId,
          records: [],
          summary: {
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
          }
        };
      }
      
      userReports[userId].records.push(record);
      userReports[userId].summary.totalDays++;
      userReports[userId].summary.totalHours += record.totalHours || 0;
      userReports[userId].summary.totalOvertime += record.overtimeHours || 0;
      userReports[userId].summary.totalLateMinutes += record.lateMinutes || 0;
      userReports[userId].summary.totalEarlyLeaveMinutes += record.earlyLeaveMinutes || 0;
      
      if (record.status) {
        userReports[userId].summary[record.status]++;
      }
    });
    
    res.json(Object.values(userReports));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update attendance record (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { checkIn, checkOut, status, notes } = req.body;
    
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    if (checkIn) attendance.checkIn = { ...attendance.checkIn, ...checkIn };
    if (checkOut) attendance.checkOut = { ...attendance.checkOut, ...checkOut };
    if (status) attendance.status = status;
    if (notes !== undefined) attendance.notes = notes;
    
    attendance.approvedBy = req.user.id;
    attendance.approvedAt = new Date();
    
    await attendance.save();
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete attendance record (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    
    await attendance.remove();
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 