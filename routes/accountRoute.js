const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation')

// Account management view route
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Registration processing route
router.post(
  '/register',
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Account update routes
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount));
router.post('/update', utilities.checkLogin, utilities.handleErrors(accountController.updateAccount));
router.post('/update-password', utilities.checkLogin, utilities.handleErrors(accountController.updatePassword));

// Logout route
router.post('/logout', accountController.logout);

module.exports = router; 