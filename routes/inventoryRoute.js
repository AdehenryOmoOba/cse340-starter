// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get('/detail/:inv_id', invController.buildDetailView);

// Add Classification routes
router.get('/add-classification', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification));
router.post('/add-classification', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.addClassification));

// Add Inventory routes
router.get('/add-inventory', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));
router.post('/add-inventory', utilities.checkJWTToken, utilities.checkAccountType, invValidate.checkInventoryData, utilities.handleErrors(invController.addInventory));

// Edit Inventory routes
router.get('/edit/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView));
router.post('/update', utilities.checkJWTToken, utilities.checkAccountType, invValidate.checkUpdateData, utilities.handleErrors(invController.updateInventory));

// Delete Inventory routes
router.get('/delete/:inv_id', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirm));
router.post('/delete', utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryItem));

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON));

// Management view route
router.get("/", utilities.checkJWTToken, utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));

module.exports = router 