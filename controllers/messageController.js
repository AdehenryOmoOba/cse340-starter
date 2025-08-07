const messageModel = require("../models/message-model");

/**
 * Render the feedback form
 */
async function showFeedbackForm(req, res) {
  try {
    if (!res.locals.loggedin || !res.locals.accountData) {
      req.flash("notice", "You must be logged in to submit feedback.");
      return res.redirect("/account/login");
    }
    if (res.locals.accountData.account_type !== 'Client') {
      req.flash("notice", "Only clients can send feedback.");
      return res.redirect("/");
    }
    res.render("messages/new", { title: "Submit Feedback" });
  } catch (error) {
    res.status(500).render("errors/error", { title: "Server Error", message: "Error loading feedback form." });
  }
}

/**
 * Handle feedback form submission
 */
async function submitFeedback(req, res) {
  try {
    const { message_text } = req.body;
    if (!res.locals.loggedin || !res.locals.accountData) {
      req.flash("notice", "You must be logged in to submit feedback.");
      return res.redirect("/account/login");
    }
    if (res.locals.accountData.account_type !== 'Client') {
      req.flash("notice", "Only clients can send feedback.");
      return res.redirect("/");
    }
    if (!message_text || message_text.trim().length < 5) {
      req.flash("notice", "Message must be at least 5 characters.");
      return res.redirect("/messages/new");
    }
    await messageModel.insertMessage(res.locals.accountData.account_id, message_text.trim());
    req.flash("notice", "Thank you, your feedback has been sent.");
    res.redirect("/");
  } catch (error) {
    res.status(500).render("errors/error", { title: "Server Error", message: "Error submitting feedback." });
  }
}

/**
 * Display all messages (admin only)
 */
async function showAllMessages(req, res) {
  try {
    if (!res.locals.loggedin || !res.locals.accountData || res.locals.accountData.account_type !== "Admin") {
      req.flash("notice", "You do not have permission to view this page.");
      return res.redirect("/");
    }
    const messages = await messageModel.getAllMessages();
    res.render("messages/index", { title: "All User Feedback", messages });
  } catch (error) {
    res.status(500).render("errors/error", { title: "Server Error", message: "Error loading messages." });
  }
}

module.exports = {
  showFeedbackForm,
  submitFeedback,
  showAllMessages,
};