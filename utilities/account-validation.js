const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
  return [
    // firstname is required and must be string
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a first name."),

    // lastname is required and must be string
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty().withMessage("Please provide a last name."),

    // valid email is required and cannot already exist in the database
    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("A valid email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),

    // password is required and must be strong password
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password does not meet requirements.")
      .bail()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      }).withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

// Login validation rules
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty().withMessage("A valid email is required.")
      .bail()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail(),
    body("account_password")
      .trim()
      .notEmpty().withMessage("Password is required.")
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    })
    return
  }
  next()
}

module.exports = validate 