const Group = require('../models/Group');
const Expense = require('../models/Expense');
const settlementService = require('../services/settlementService');

exports.createGroup = async (req, res) => {
  try {
    const { name, members, currency } = req.body;
    
    // Ensure members is an array of objects for the schema
    const memberObjects = members.map(m => ({ name: m }));
    
    const group = new Group({
      name,
      currency,
      members: memberObjects,
      creator_id: req.user.id
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
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