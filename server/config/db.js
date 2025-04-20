const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // necesario para Railway
  },
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL en Railway'))
  .catch((err) => console.error('❌ Error al conectar con PostgreSQL:', err));

module.exports = pool;
