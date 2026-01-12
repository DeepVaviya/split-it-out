const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  isSettled: { type: Boolean, default: false }, // New field
  paid_by: [{
    member_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true }
  }]
});

module.exports = mongoose.model('Expense', ExpenseSchema);