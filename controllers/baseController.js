const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res, next) {
  // req.flash("notice", "This is a flash message.");
  res.render("index", { title: "Home" });
}

module.exports = baseController 