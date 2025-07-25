const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation')

// Login view route
router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Registration processing route
router.post(
  '/register',
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

module.exports = router; 