const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/expenseController');

// Using 'auth' middleware ensures only logged-in users can add expenses
router.post('/', auth, controller.addExpense);

module.exports = router;