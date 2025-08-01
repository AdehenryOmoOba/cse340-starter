const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getVehicleById(inv_id) {
  const db = require('../database'); // adjust if needed
  const sql = 'SELECT * FROM inventory WHERE inventory_id = $1';
  const data = await db.query(sql, [inv_id]);
  return data.rows[0];
}

async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO classification (classification_name) VALUES ($1) RETURNING *';
    const data = await pool.query(sql, [classification_name]);
    return data.rowCount > 0;
  } catch (error) {
    console.error('addClassification error', error);
    return false;
  }
}

async function addInventory(data) {
  try {
    const sql = `INSERT INTO inventory (classification_id, inventory_make, inventory_model, inventory_year, inventory_description, inventory_image, inventory_thumbnail, inventory_price, inventory_miles, inventory_color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const values = [
      data.classification_id,
      data.inv_make,
      data.inv_model,
      data.inv_year,
      data.inv_description,
      data.inv_image,
      data.inv_thumbnail,
      data.inv_price,
      data.inv_miles,
      data.inv_color
    ];
    const result = await pool.query(sql, values);
    return result.rowCount > 0;
  } catch (error) {
    console.error('addInventory error', error);
    return false;
  }
}

/* ***************************
 *  Get inventory item by ID
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = 'SELECT * FROM inventory WHERE inventory_id = $1';
    const data = await pool.query(sql, [inv_id]);
    return data.rows[0];
  } catch (error) {
    console.error('getInventoryById error', error);
    return null;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inventory_make = $1, inventory_model = $2, inventory_description = $3, inventory_image = $4, inventory_thumbnail = $5, inventory_price = $6, inventory_year = $7, inventory_miles = $8, inventory_color = $9, classification_id = $10 WHERE inventory_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
    return null
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory, getInventoryById, updateInventory} 