const invModel = require('../models/inventory-model');
const utilities = require('../utilities');

async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    let nav = await utilities.getNav();
    let className = "";
    let grid = "";
    let notice = null;
    if (!data || data.length === 0) {
      // Get classification name for title if possible
      const classifications = await invModel.getClassifications();
      const found = classifications.rows.find(c => c.classification_id == classification_id);
      className = found ? found.classification_name : "Inventory";
      notice = "Sorry, no matching vehicles could be found.";
      grid = '';
    } else {
      grid = await utilities.buildClassificationGrid(data);
      className = data[0].classification_name;
    }
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      notice
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

async function buildManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const messages = req.flash('notice') || [];
    const classificationList = await utilities.buildClassificationList();
    res.render('inventory/management', {
      title: 'Inventory Management',
      nav,
      messages,
      classificationList
    });
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(classification_id);
  if (invData && invData.length) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
}

async function buildAddClassification(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const messages = req.flash('notice') || [];
    res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      messages,
      errors: [],
      classification_name: ''
    });
  } catch (error) {
    next(error);
  }
}

async function addClassification(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  let errors = [];
  // Server-side validation
  if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
    errors.push('Classification name must not contain spaces or special characters.');
  }
  if (errors.length) {
    return res.render('inventory/add-classification', {
      title: 'Add Classification',
      nav,
      messages: [],
      errors,
      classification_name
    });
  }
  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash('notice', 'Classification added successfully.');
      // Rebuild nav to show new classification
      nav = await utilities.getNav();
      return res.redirect('/inv/');
    } else {
      req.flash('notice', 'Failed to add classification.');
      return res.render('inventory/add-classification', {
        title: 'Add Classification',
        nav,
        messages: ['Failed to add classification.'],
        errors: [],
        classification_name
      });
    }
  } catch (error) {
    next(error);
  }
}

async function buildAddInventory(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const messages = req.flash('notice') || [];
    res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      messages,
      errors: [],
      // Sticky fields
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '',
      inv_thumbnail: '',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: ''
    });
  } catch (error) {
    next(error);
  }
}

async function addInventory(req, res, next) {
  let nav = await utilities.getNav();
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  } = req.body;
  let errors = [];
  // Server-side validation
  if (!classification_id) errors.push('Classification is required.');
  if (!inv_make) errors.push('Make is required.');
  if (!inv_model) errors.push('Model is required.');
  if (!inv_year || isNaN(inv_year)) errors.push('Year is required and must be a number.');
  if (!inv_description) errors.push('Description is required.');
  if (!inv_image) errors.push('Image path is required.');
  if (!inv_thumbnail) errors.push('Thumbnail path is required.');
  if (!inv_price || isNaN(inv_price)) errors.push('Price is required and must be a number.');
  if (!inv_miles || isNaN(inv_miles)) errors.push('Miles is required and must be a number.');
  if (!inv_color) errors.push('Color is required.');
  if (errors.length) {
    const classificationList = await utilities.buildClassificationList(classification_id);
    return res.render('inventory/add-inventory', {
      title: 'Add Inventory',
      nav,
      classificationList,
      messages: [],
      errors,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }
  try {
    const result = await invModel.addInventory({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });
    if (result) {
      req.flash('notice', 'Inventory item added successfully.');
      nav = await utilities.getNav();
      return res.redirect('/inv/');
    } else {
      req.flash('notice', 'Failed to add inventory item.');
      const classificationList = await utilities.buildClassificationList(classification_id);
      return res.render('inventory/add-inventory', {
        title: 'Add Inventory',
        nav,
        classificationList,
        messages: ['Failed to add inventory item.'],
        errors: [],
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      });
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildByClassificationId,
  buildDetailView,
  buildManagement,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
  getInventoryJSON,
}; 