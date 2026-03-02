// backend/config/db.js
require('dotenv').config(); // Load environment variables (like DB_HOST, DB_USER, etc.)

// PostgreSQL connection using pg (node-postgres)
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test the connection
pool.query('SELECT NOW()')
    .then(() => {
        console.log('PostgreSQL connection pool created and tested successfully from db.js!');
    })
    .catch(err => {
        console.error('Warning: Initial PostgreSQL connection test failed from db.js:', err.message);
        console.error('The application will continue to run. Database connections will be retried when needed.');
    });

// Helper to convert MySQL-style ? placeholders to PostgreSQL $1, $2, etc.
const convertPlaceholders = (sql, params) => {
    if (params && params.length > 0) {
        let paramIndex = 1;
        const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        return { sql: convertedSql, params };
    }
    return { sql, params };
};

// Add execute method for compatibility (converts ? placeholders to PostgreSQL format)
pool.execute = async (sql, params) => {
    const { sql: convertedSql, params: convertedParams } = convertPlaceholders(sql, params);
    return pool.query(convertedSql, convertedParams);
};

// Wrap pool to provide connection interface with transaction support
pool.getConnection = async () => {
    const client = await pool.connect();
    // Return a connection object with transaction support
    return {
        query: (sql, params) => {
            // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
            const { sql: convertedSql, params: convertedParams } = convertPlaceholders(sql, params);
            return client.query(convertedSql, convertedParams);
        },
        execute: (sql, params) => {
            // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
            const { sql: convertedSql, params: convertedParams } = convertPlaceholders(sql, params);
            return client.query(convertedSql, convertedParams);
        },
        beginTransaction: async () => {
            await client.query('BEGIN');
        },
        commit: async () => {
            await client.query('COMMIT');
        },
        rollback: async () => {
            await client.query('ROLLBACK');
        },
        release: () => client.release(),
        end: () => client.release(),
        // Add PostgreSQL-specific methods
        client: client,
    };
};

// Export helper function to convert queries
pool.convertQuery = convertPlaceholders;

// Export the pool
module.exports = pool;
