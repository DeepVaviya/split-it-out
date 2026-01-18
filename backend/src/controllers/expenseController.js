const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, payments, date } = req.body;

    // Validate required fields
    if (!groupId || !title || !amount || !payments) {
      return res.status(400).json({ message: "GroupId, title, amount, and payments are required" });
    }

    if (!Array.isArray(payments) || payments.length === 0) {
      return res.status(400).json({ message: "Invalid payments data" });
    }

    const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    
    if (Math.abs(totalPaid - parseFloat(amount)) > 0.01) {
      return res.status(400).json({ message: `Paid amount (${totalPaid}) does not match total expense (${amount})` });
    }

    const expense = new Expense({
      group_id: groupId,
      title: title.trim(),
      amount: parseFloat(amount),
      date: date || Date.now(),
      paid_by: payments
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Add Expense Error:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Return generic error in production, detailed in development
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ error: err.message, details: err.stack });
    } else {
      res.status(500).json({ message: 'Failed to add expense' });
    }
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