const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Route to handle tracking events (OPEN, SLIDE_LEAVE, COMPLETE)
router.post('/', trackingController.handleEvent);

module.exports = router;
