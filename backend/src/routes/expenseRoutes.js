const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/expenseController');

router.post('/', auth, controller.addExpense);
router.get('/group/:groupId', auth, controller.getExpenses); // Get expenses for a group
router.put('/:id', auth, controller.updateExpenseStatus); // Toggle Paid/Unpaid
router.delete('/:id', auth, controller.deleteExpense); // Delete Expense

module.exports = router;