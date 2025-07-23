const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      return next(); // triggers 404
    }
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
}

async function buildDetailView(req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const vehicle = await invModel.getVehicleById(inv_id);
    if (!vehicle) {
      return next(); // triggers 404
    }
    res.render('inventory/detail', {
      title: `${vehicle.inventory_make} ${vehicle.inventory_model}`,
      vehicle
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildByClassificationId,
  buildDetailView,
}; 