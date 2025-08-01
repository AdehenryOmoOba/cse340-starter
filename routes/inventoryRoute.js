// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get('/detail/:inv_id', invController.buildDetailView);

// Add Classification routes
router.get('/add-classification', utilities.handleErrors(invController.buildAddClassification));
router.post('/add-classification', utilities.handleErrors(invController.addClassification));

// Add Inventory routes
router.get('/add-inventory', utilities.handleErrors(invController.buildAddInventory));
router.post('/add-inventory', utilities.handleErrors(invController.addInventory));

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Management view route
router.get("/", utilities.handleErrors(invController.buildManagement));

module.exports = router 