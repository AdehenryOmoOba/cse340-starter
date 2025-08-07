const pool = require("../database/index");

/**
 * Insert a new message into the messages table
 * @param {number} account_id
 * @param {string} message_text
 * @returns {Promise<object>} The inserted message
 */
async function insertMessage(account_id, message_text) {
  try {
    const sql = `INSERT INTO messages (account_id, message_text) VALUES ($1, $2) RETURNING *`;
    const result = await pool.query(sql, [account_id, message_text]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve all messages, joined with account info
 * @returns {Promise<Array>} List of messages with user info
 */
async function getAllMessages() {
  try {
    const sql = `SELECT m.*, a.account_firstname, a.account_lastname, a.account_email FROM messages m JOIN account a ON m.account_id = a.account_id ORDER BY m.created_at DESC`;
    const result = await pool.query(sql);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  insertMessage,
  getAllMessages,
};