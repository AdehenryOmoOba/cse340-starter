const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");

// Show feedback form
router.get("/new", messageController.showFeedbackForm);

// Handle feedback submission
router.post("/", messageController.submitFeedback);

// Admin: view all messages
router.get("/", messageController.showAllMessages);

module.exports = router;