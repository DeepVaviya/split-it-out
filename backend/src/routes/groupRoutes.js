const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const controller = require('../controllers/groupController');

router.post('/', auth, controller.createGroup);
router.get('/my', auth, controller.getMyGroups);
router.delete('/:id', auth, controller.deleteGroup); // Add Delete route
router.get('/:id', controller.getGroup);

module.exports = router;