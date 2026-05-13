const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

// Basic status check route
router.get('/status', apiController.getStatus);

// Mock route for future symptom analysis
router.post('/analyze-symptoms', apiController.analyzeSymptoms);

// Mock route for user authentication
router.post('/auth/login', apiController.loginUser);

// Route for dynamic nearby help using location
router.post('/nearby-help', apiController.getNearbyHelp);

module.exports = router;
