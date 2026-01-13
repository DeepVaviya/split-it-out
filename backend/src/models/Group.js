const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  currency: { type: String, default: '₹' },
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [MemberSchema],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Group', GroupSchema);