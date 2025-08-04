const utilities = require('../utilities');
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/login', {
    title: 'Login',
    nav,
    errors: null
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render('account/register', {
    title: 'Register',
    nav,
    errors: null
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver account management view
 * ************************************ */
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav();
  const accountData = res.locals.accountData;
  const flashMessages = req.flash('notice');
  res.render('account/management', {
    title: "Account Management",
    nav,
    errors: [],
    messages: Array.isArray(flashMessages) ? flashMessages : [],
    account_firstname: accountData ? accountData.account_firstname : null,
  });
}

/* ****************************************
 *  Build update account view
 * ************************************ */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav();
  const account_id = parseInt(req.params.account_id);
  const accountData = await accountModel.getAccountById(account_id);
  
  if (!accountData) {
    req.flash('notice', 'Account not found.');
    return res.redirect('/account/');
  }
  
  res.render('account/update', {
    title: 'Update Account Information',
    nav,
    errors: [],
    messages: [],
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  });
}

/* ****************************************
 *  Update account information
 * ************************************ */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body;
  
  // Server-side validation
  let errors = [];
  if (!account_firstname || account_firstname.trim().length < 2) {
    errors.push('First name must be at least 2 characters long.');
  }
  if (!account_lastname || account_lastname.trim().length < 2) {
    errors.push('Last name must be at least 2 characters long.');
  }
  if (!account_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account_email)) {
    errors.push('Please provide a valid email address.');
  }
  
  // Check if email already exists (if email is being changed)
  const currentAccount = await accountModel.getAccountById(account_id);
  if (currentAccount.account_email !== account_email) {
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount) {
      errors.push('Email address is already in use.');
    }
  }
  
  if (errors.length > 0) {
    return res.render('account/update', {
      title: 'Update Account Information',
      nav,
      errors,
      messages: [],
      account_id,
      account_firstname,
      account_lastname,
      account_email
    });
  }
  
  // Update account
  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);
  
  if (updateResult) {
    // Update the JWT token with new account information
    const updatedAccountData = {
      account_id: parseInt(account_id),
      account_firstname,
      account_lastname,
      account_email,
      account_type: res.locals.accountData.account_type
    };
    
    const newAccessToken = jwt.sign(updatedAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 });
    
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", newAccessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", newAccessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 });
    }
    
    req.flash('notice', 'Account information updated successfully.');
    res.redirect('/account/');
  } else {
    req.flash('notice', 'Failed to update account information.');
    res.redirect('/account/');
  }
}

/* ****************************************
 *  Update password
 * ************************************ */
async function updatePassword(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password, account_password_confirm } = req.body;
  
  // Server-side validation
  let errors = [];
  if (!account_password || account_password.length < 12) {
    errors.push('Password must be at least 12 characters long.');
  }
  if (!/(?=.*[a-z])/.test(account_password)) {
    errors.push('Password must contain at least 1 lowercase character.');
  }
  if (!/(?=.*[A-Z])/.test(account_password)) {
    errors.push('Password must contain at least 1 uppercase character.');
  }
  if (!/(?=.*\d)/.test(account_password)) {
    errors.push('Password must contain at least 1 number.');
  }
  if (!/(?=.*[!@#$%^&*])/.test(account_password)) {
    errors.push('Password must contain at least 1 special character (!@#$%^&*).');
  }
  if (account_password !== account_password_confirm) {
    errors.push('Passwords do not match.');
  }
  
  if (errors.length > 0) {
    const accountData = await accountModel.getAccountById(account_id);
    return res.render('account/update', {
      title: 'Update Account Information',
      nav,
      errors,
      messages: [],
      account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email
    });
  }
  
  // Hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash('notice', 'Error processing password update.');
    return res.redirect('/account/');
  }
  
  // Update password
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword);
  
  if (updateResult) {
    req.flash('notice', 'Password updated successfully.');
    res.redirect('/account/');
  } else {
    req.flash('notice', 'Failed to update password.');
    res.redirect('/account/');
  }
}

/* ****************************************
 *  Logout controller
 * ************************************ */
function logout(req, res) {
  res.clearCookie('jwt');
  req.flash('notice', 'You have been logged out.');
  res.redirect('/');
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, buildUpdateAccount, updateAccount, updatePassword, logout }; 