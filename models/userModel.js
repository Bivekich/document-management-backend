const pool = require('../config/db');

const createUser = async (full_name, email, password, verification_token) => {
  const query = `INSERT INTO users (full_name, email, password, verification_token) VALUES ($1, $2, $3, $4) RETURNING *`;
  const values = [full_name, email, password, verification_token];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const findUserByToken = async (token) => {
  const query = 'SELECT * FROM users WHERE verification_token = $1';
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

const verifyUserEmail = async (token) => {
  const query = `UPDATE users SET is_verified = true, verification_token = null WHERE verification_token = $1 RETURNING *`;
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserByToken,
  verifyUserEmail,
};
