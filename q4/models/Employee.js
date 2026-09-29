const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  empId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  basicPay: {
    type: Number,
    required: true,
    default: 0
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  salary: {
    type: Number,
    required: true,
    default: 0
  },
  password: {
    type: String,
    required: true
  },
  rawPassword: {
    type: String
  }
}, { timestamps: true });

// Pre-save hook to ensure salary calculation
employeeSchema.pre('save', function(next) {
  this.salary = (this.basicPay || 0) + (this.allowances || 0) - (this.deductions || 0);
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
