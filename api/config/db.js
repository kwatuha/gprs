// backend/config/db.js
require('dotenv').config(); // Load environment variables (like DB_HOST, DB_USER, etc.)

const DB_TYPE = process.env.DB_TYPE || 'mysql'; // 'mysql' or 'postgresql'

let pool;

if (DB_TYPE === 'postgresql') {
    // PostgreSQL connection using pg (node-postgres)
    const { Pool } = require('pg');
    
    pool = new Pool({
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
    
    // Add execute method for MySQL compatibility
    pool.execute = async (sql, params) => {
        // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
        if (params && params.length > 0) {
            let paramIndex = 1;
            const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
            return pool.query(convertedSql, params);
        }
        return pool.query(sql);
    };
    
    // Wrap pool to provide MySQL-like interface for compatibility
    pool.getConnection = async () => {
        const client = await pool.connect();
        // Return a MySQL-like connection object
        return {
            query: (sql, params) => {
                // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
                if (params && params.length > 0) {
                    let paramIndex = 1;
                    const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
                    return client.query(convertedSql, params);
                }
                return client.query(sql);
            },
            execute: (sql, params) => {
                // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc.
                if (params && params.length > 0) {
                    let paramIndex = 1;
                    const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
                    return client.query(convertedSql, params);
                }
                return client.query(sql);
            },
            release: () => client.release(),
            end: () => client.release(),
            // Add PostgreSQL-specific methods
            client: client,
        };
    };
    
} else {
    // MySQL connection using mysql2 (legacy support)
    const mysql = require('mysql2/promise');
    
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: 'utf8mb4'
    });
    
    // Test the connection
    pool.getConnection()
        .then(connection => {
            console.log('MySQL connection pool created and tested successfully from db.js!');
            connection.release();
        })
        .catch(err => {
            console.error('Warning: Initial MySQL connection test failed from db.js:', err.message);
            console.error('The application will continue to run. Database connections will be retried when needed.');
        });
}

// Export a unified interface
module.exports = pool;

// Export helper function to convert MySQL queries to PostgreSQL
module.exports.convertQuery = (sql, params) => {
    if (DB_TYPE === 'postgresql' && params && params.length > 0) {
        let paramIndex = 1;
        const convertedSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
        return { sql: convertedSql, params };
    }
    return { sql, params };
};

// Export DB type for conditional logic
module.exports.DB_TYPE = DB_TYPE;
