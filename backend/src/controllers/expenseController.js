const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, payments, date } = req.body;

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ message: "Invalid payments data" });
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    if (Math.abs(totalPaid - amount) > 0.01) {
      return res.status(400).json({ message: "Paid amount does not match total expense amount" });
    }

    const expense = new Expense({
      group_id: groupId,
      title,
      amount,
      date: date || Date.now(),
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

// REMOVED: exports.updateExpenseStatus

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};