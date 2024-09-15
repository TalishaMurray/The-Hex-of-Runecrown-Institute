const mysql = require('mysql2/promise');

// Create a connection pool to MySQL using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Create a new user (register)
async function createUser(username, passwordHash) {
  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  const [result] = await pool.execute(query, [username, passwordHash]);
  return { id: result.insertId, username };
}

// Find a user by username (login)
async function findUserByUsername(username) {
  const query = 'SELECT * FROM users WHERE username = ?';
  const [rows] = await pool.execute(query, [username]);
  return rows[0];
}

module.exports = {
  createUser,
  findUserByUsername
};
