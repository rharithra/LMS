const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  startTime: {
    type: String,
    required: true,
    // Format: "HH:MM" (24-hour)
  },
  endTime: {
    type: String,
    required: true,
    // Format: "HH:MM" (24-hour)
  },
  breakTime: {
    type: Number,
    default: 60, // minutes
  },
  totalHours: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6' // Blue color for UI
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  }
}, {
  timestamps: true
});

// Virtual for calculating total hours
shiftSchema.virtual('calculatedHours').get(function() {
  const start = this.startTime.split(':').map(Number);
  const end = this.endTime.split(':').map(Number);
  
  let startMinutes = start[0] * 60 + start[1];
  let endMinutes = end[0] * 60 + end[1];
  
  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }
  
  return Math.round((endMinutes - startMinutes - this.breakTime) / 60 * 100) / 100;
});

// Pre-save middleware to calculate total hours
shiftSchema.pre('save', function(next) {
  this.totalHours = this.calculatedHours;
  next();
});

module.exports = mongoose.model('Shift', shiftSchema); 