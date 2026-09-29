const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  empId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  grant: {
    type: String,
    enum: ['Yes', 'No', 'Pending'],
    default: 'No'
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
