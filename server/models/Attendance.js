const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: {
      type: Date,
      required: true
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'system'],
      default: 'manual'
    },
    location: {
      type: String,
      default: null
    }
  },
  checkOut: {
    time: {
      type: Date,
      default: null
    },
    method: {
      type: String,
      enum: ['manual', 'biometric', 'system'],
      default: 'manual'
    },
    location: {
      type: String,
      default: null
    }
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_leave', 'half_day', 'overtime'],
    default: 'present'
  },
  totalHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  earlyLeaveMinutes: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

// Virtual for calculating work hours
attendanceSchema.virtual('workHours').get(function() {
  if (!this.checkOut.time) return 0;
  const diffMs = this.checkOut.time - this.checkIn.time;
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
});

// Pre-save middleware to calculate hours and status
attendanceSchema.pre('save', function(next) {
  if (this.checkOut.time) {
    this.totalHours = this.workHours;
    
    // Calculate overtime (assuming 8 hours is standard work day)
    const standardHours = 8;
    this.overtimeHours = Math.max(0, this.totalHours - standardHours);
    
    // Calculate late minutes (assuming 9 AM is start time)
    const startTime = new Date(this.date);
    startTime.setHours(9, 0, 0, 0);
    if (this.checkIn.time > startTime) {
      this.lateMinutes = Math.round((this.checkIn.time - startTime) / (1000 * 60));
    }
    
    // Calculate early leave minutes (assuming 5 PM is end time)
    const endTime = new Date(this.date);
    endTime.setHours(17, 0, 0, 0);
    if (this.checkOut.time < endTime) {
      this.earlyLeaveMinutes = Math.round((endTime - this.checkOut.time) / (1000 * 60));
    }
    
    // Determine status
    if (this.lateMinutes > 30) {
      this.status = 'late';
    } else if (this.earlyLeaveMinutes > 60) {
      this.status = 'early_leave';
    } else if (this.totalHours < 4) {
      this.status = 'half_day';
    } else if (this.overtimeHours > 0) {
      this.status = 'overtime';
    }
  }
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema); 