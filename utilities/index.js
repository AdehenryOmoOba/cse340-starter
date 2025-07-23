const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inventory_id 
      + '" title="View ' + vehicle.inventory_make + ' '+ vehicle.inventory_model 
      + ' details"><img src="' + vehicle.inventory_thumbnail 
      +'" alt="Image of '+ vehicle.inventory_make + ' ' + vehicle.inventory_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inventory_id +'" title="View ' 
      + vehicle.inventory_make + ' ' + vehicle.inventory_model + ' details">' 
      + vehicle.inventory_make + ' ' + vehicle.inventory_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inventory_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

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

module.exports = {
  getNav: Util.getNav,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildVehicleDetailHtml,
  handleErrors,
}; 