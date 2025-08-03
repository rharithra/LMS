const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  leavePolicies: {
    annual: {
      defaultDays: { type: Number, default: 20 },
      maxDays: { type: Number, default: 25 },
      minNoticeDays: { type: Number, default: 7 }
    },
    sick: {
      defaultDays: { type: Number, default: 10 },
      maxDays: { type: Number, default: 15 },
      requiresDocumentation: { type: Boolean, default: true }
    },
    personal: {
      defaultDays: { type: Number, default: 5 },
      maxDays: { type: Number, default: 10 },
      minNoticeDays: { type: Number, default: 3 }
    },
    maternity: {
      defaultDays: { type: Number, default: 90 },
      maxDays: { type: Number, default: 90 }
    },
    paternity: {
      defaultDays: { type: Number, default: 14 },
      maxDays: { type: Number, default: 14 }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true
});

// Virtual for employee count
departmentSchema.virtual('employeeCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'department',
  count: true
});

// Ensure virtual fields are serialized
departmentSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Department', departmentSchema); 