const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Shift = require('../models/Shift');

// Get all shifts
router.get('/', auth, async (req, res) => {
  try {
    const { department, isActive } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const shifts = await Shift.find(query)
      .populate('department', 'name')
      .sort({ name: 1 });
    
    res.json(shifts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single shift
router.get('/:id', auth, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate('department', 'name');
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    res.json(shift);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new shift
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      startTime,
      endTime,
      breakTime,
      description,
      color,
      department
    } = req.body;
    
    const shift = new Shift({
      name,
      startTime,
      endTime,
      breakTime: breakTime || 60,
      description,
      color,
      department
    });
    
    await shift.save();
    
    res.status(201).json(shift);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Shift name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update shift
router.put('/:id', auth, async (req, res) => {
  try {
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
    
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    if (name) shift.name = name;
    if (startTime) shift.startTime = startTime;
    if (endTime) shift.endTime = endTime;
    if (breakTime !== undefined) shift.breakTime = breakTime;
    if (description !== undefined) shift.description = description;
    if (color) shift.color = color;
    if (department !== undefined) shift.department = department;
    if (isActive !== undefined) shift.isActive = isActive;
    
    await shift.save();
    
    res.json(shift);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Shift name already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Delete shift
router.delete('/:id', auth, async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }
    
    await shift.remove();
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 