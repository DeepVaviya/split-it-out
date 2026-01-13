const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, payments, date } = req.body; // Added date
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (Math.abs(totalPaid - amount) > 0.1) {
      return res.status(400).json({ message: "Paid amount does not match total expense amount" });
    }

    const expense = new Expense({
      group_id: groupId,
      title,
      amount,
      date: date || Date.now(), // Use provided date or default to now
      paid_by: payments
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group_id: req.params.groupId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExpenseStatus = async (req, res) => {
  try {
    const { isSettled } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.id, 
      { isSettled }, 
      { new: true }
    );
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};