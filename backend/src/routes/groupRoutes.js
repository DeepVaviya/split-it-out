const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/groupController');

router.post('/', auth, controller.createGroup);
router.get('/my', auth, controller.getMyGroups);
router.get('/:id', controller.getGroup); // Public read access

module.exports = router;