const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: function() {
      return this.isHalfDay;
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
leaveSchema.index({ employee: 1, startDate: 1 });
leaveSchema.index({ status: 1, createdAt: 1 });

// Virtual for total days
leaveSchema.virtual('totalDays').get(function() {
  if (this.isHalfDay) {
    return this.duration * 0.5;
  }
  return this.duration;
});

// Method to check if dates overlap
leaveSchema.methods.hasDateOverlap = function() {
  return this.model('Leave').find({
    employee: this.employee,
    status: { $in: ['pending', 'approved'] },
    $or: [
      {
        startDate: { $lte: this.endDate },
        endDate: { $gte: this.startDate }
      }
    ],
    _id: { $ne: this._id }
  });
};

// Ensure virtual fields are serialized
leaveSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Leave', leaveSchema); 