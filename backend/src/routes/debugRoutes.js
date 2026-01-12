const express = require('express');
const router = express.Router();
const controller = require('../controllers/debugController');

// Echo endpoint for debugging request payloads/headers
router.all('/echo', controller.echo);

module.exports = router;
