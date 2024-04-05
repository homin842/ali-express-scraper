const { Pool, Client } = require("pg");

/* Using Pool:
   - Pool maintains a pool of client connections, allowing multiple clients to use the same connection pool.
   - Recommended for applications with frequent database interactions, where maintaining a pool of connections can improve performance.
   - Automatically handles connection pooling, reusing existing connections where possible.
*/
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})


/* Using Client:
   - Client creates a single connection to the database for each instance.
   - Suitable for applications with low to moderate database interaction, or when you need more control over individual connections.
   - Does not manage connection pooling explicitly, so it may not be suitable for high-concurrency applications.
*/
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

module.exports = { pool, client }
