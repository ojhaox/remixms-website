const pool = require('./config/database');

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the database!');
        
        // Test a simple query
        const [rows] = await connection.query('SELECT VERSION() as version');
        console.log('MySQL Version:', rows[0].version);
        
        connection.release();
    } catch (error) {
        console.error('Error connecting to the database:', error);
    } finally {
        // Close the pool
        await pool.end();
    }
}

testConnection(); 