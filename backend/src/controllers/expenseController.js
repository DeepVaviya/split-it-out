const Expense = require('../models/Expense');

exports.addExpense = async (req, res) => {
  try {
    const { groupId, title, amount, payments } = req.body;
    
    // Basic validation: Ensure payments match total amount
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Allow a tiny difference for floating point math
    if (Math.abs(totalPaid - amount) > 0.1) {
      return res.status(400).json({ message: "Paid amount does not match total expense amount" });
    }

    const expense = new Expense({
      group_id: groupId,
      title,
      amount,
      paid_by: payments
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};