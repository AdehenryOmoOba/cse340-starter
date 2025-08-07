const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req = null) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  // Add feedback link for logged-in users
  if (req && req.session && req.session.account_id) {
    list += '<li><a href="/messages/new" title="Send Feedback">Send Feedback</a></li>';
    // Admin link
    if (req.session.account_type === "Admin") {
      list += '<li><a href="/messages" title="View Feedback">View Feedback</a></li>';
    }
  }
  list += "</ul>";
  return list;
};

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid;
  if(data.length > 0){
    grid = '<ul id="inv-display">';
    data.forEach(vehicle => {
      grid += '<li>';
      grid += `<a href="../../inv/detail/${vehicle.inventory_id}" title="View ${vehicle.inventory_make} ${vehicle.inventory_model} details">
        <img src="${vehicle.inventory_thumbnail}"
          alt="Image of ${vehicle.inventory_make} ${vehicle.inventory_model} on CSE Motors"
          onerror="this.onerror=null;this.style.display='none';this.insertAdjacentHTML('afterend', '<div class=\\'no-image-placeholder\\'><span>no image</span></div>');" />
      </a>`;
      grid += '<div class="namePrice">';
      grid += '<hr />';
      grid += '<h2>';
      grid += `<a href="../../inv/detail/${vehicle.inventory_id}" title="View ${vehicle.inventory_make} ${vehicle.inventory_model} details">${vehicle.inventory_make} ${vehicle.inventory_model}</a>`;
      grid += '</h2>';
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inventory_price)}</span>`;
      grid += '</div>';
      grid += '</li>';
    });
    grid += '</ul>';
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

function buildVehicleDetailHtml(vehicle) {
  const price = Number(vehicle.inventory_price).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const miles = Number(vehicle.inventory_miles).toLocaleString('en-US');
  return `
    <div class="vehicle-detail">
      <img src="${vehicle.inventory_image}" alt="${vehicle.inventory_make} ${vehicle.inventory_model}" class="vehicle-image"/>
      <div class="vehicle-info">
        <h2>${vehicle.inventory_year} ${vehicle.inventory_make} ${vehicle.inventory_model}</h2>
        <p class="vehicle-price">${price}</p>
        <p><strong>Mileage:</strong> ${miles} miles</p>
        <p><strong>Color:</strong> ${vehicle.inventory_color}</p>
        <p>${vehicle.inventory_description}</p>
      </div>
    </div>
  `;
}

function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies && req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = 1
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Account Type
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin && res.locals.accountData) {
    const accountType = res.locals.accountData.account_type
    if (accountType === "Employee" || accountType === "Admin") {
      next()
    } else {
      req.flash("notice", "Access denied. Employee or Admin privileges required.")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ***************************
 *  Check Inventory Rules
 * ************************** */
function checkInventoryRules(inv_make, inv_model, inv_year, inv_price, inv_miles, inv_color, inv_description, inv_image, inv_thumbnail, classification_id) {
  let errors = []
  if (!inv_make || inv_make.trim().length < 3) {
    errors.push('Make must be at least 3 characters long.')
  }
  if (!inv_model || inv_model.trim().length < 3) {
    errors.push('Model must be at least 3 characters long.')
  }
  if (!inv_year || isNaN(inv_year) || inv_year < 1900 || inv_year > 2099) {
    errors.push('Year must be a valid number between 1900 and 2099.')
  }
  if (!inv_price || isNaN(inv_price) || inv_price <= 0) {
    errors.push('Price must be a valid positive number.')
  }
  if (!inv_miles || isNaN(inv_miles) || inv_miles < 0) {
    errors.push('Miles must be a valid non-negative number.')
  }
  if (!inv_color || inv_color.trim().length < 1) {
    errors.push('Color is required.')
  }
  if (!inv_description || inv_description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long.')
  }
  if (!inv_image || inv_image.trim().length < 1) {
    errors.push('Image path is required.')
  }
  if (!inv_thumbnail || inv_thumbnail.trim().length < 1) {
    errors.push('Thumbnail path is required.')
  }
  if (!classification_id) {
    errors.push('Classification is required.')
  }
  return errors
}

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildVehicleDetailHtml,
  handleErrors,
  buildClassificationList: Util.buildClassificationList,
  checkJWTToken: Util.checkJWTToken,
  checkLogin: Util.checkLogin,
  checkAccountType: Util.checkAccountType,
  checkInventoryRules,
}; 