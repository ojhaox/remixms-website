const express = require('express');
const http = require('http');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());

// Configure CORS
app.use(cors({
    origin: ['https://ojhaox.github.io', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

const pool = mysql.createPool({
    host: '51.79.248.100',  // Your VPS database
    user: 'remixms',
    password: 'winter26',
    database: 'v83',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful!');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

// Test connection on startup
testConnection();

app.post('/api/register', async (req, res) => {
    console.log('Received registration request:', req.body);
    const { username, password, email } = req.body;

    try {
        // Check if username exists
        const [existing] = await pool.execute(
            'SELECT * FROM accounts WHERE name = ?',
            [username]
        );

        if (existing.length > 0) {
            console.log('Username already exists:', username);
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user with all required fields
        const [result] = await pool.execute(
            `INSERT INTO accounts (
                name, password, email, pin, pic, loggedin, lastlogin, createdat,
                birthday, banned, characterslots, gender, tempban, greason, tos,
                rewardpoints, votepoints, hwid, language
            ) VALUES (
                ?, ?, ?, '', '', 0, NOW(), NOW(),
                '0000-00-00', 0, 3, 10, '0000-00-00 00:00:00', 0, 0,
                0, 0, '', 2
            )`,
            [username, hashedPassword, email]
        );

        console.log('User registered successfully:', username);
        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// Create HTTP server
const server = http.createServer(app);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
}); 