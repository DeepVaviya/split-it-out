const Group = require('../models/Group');
const Expense = require('../models/Expense');
const settlementService = require('../services/settlementService');

exports.createGroup = async (req, res) => {
  try {
    const { name, members, currency } = req.body;
    
    // Validate required fields
    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: 'Group name and at least one member are required' });
    }

    if (members.length < 2) {
      return res.status(400).json({ message: 'A group must have at least 2 members' });
    }

    // Check if group with same name already exists for this user
    const existingGroup = await Group.findOne({ 
      name: name.trim(), 
      creator_id: req.user.id 
    });
    
    if (existingGroup) {
      return res.status(400).json({ message: 'You already have a group with this name. Please use a different name.' });
    }

    // Ensure members is an array of objects for the schema
    const memberObjects = members.map(m => ({ name: m }));
    
    const group = new Group({
      name: name.trim(),
      currency: currency || '₹',
      members: memberObjects,
      creator_id: req.user.id
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    console.error('Create Group Error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Return generic error in production, detailed in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ error: err.message, details: err.stack });
    } else {
      res.status(500).json({ message: 'Failed to create group' });
    }
  }
};

exports.getGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    const settlements = await settlementService.calculateSettlements(req.params.id);
    res.json({ group, settlements });
  } catch (err) {
    res.status(404).json({ message: 'Group not found' });
  }
};

exports.getMyGroups = async (req, res) => {
    try {
        const groups = await Group.find({ creator_id: req.user.id }).sort({ created_at: -1 });
        res.json(groups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOneAndDelete({ _id: req.params.id, creator_id: req.user.id });
    if (!group) return res.status(404).json({ message: 'Group not found or unauthorized' });
    
    await Expense.deleteMany({ group_id: req.params.id });
    
    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};