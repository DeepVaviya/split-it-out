const Group = require('../models/Group');
const settlementService = require('../services/settlementService');

exports.createGroup = async (req, res) => {
  try {
    const { name, members, currency } = req.body;
    // Transform string array ["A", "B"] into object array for Schema
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
}