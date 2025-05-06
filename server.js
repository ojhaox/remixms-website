const express = require('express');
const path = require('path');
const pool = require('./config/database');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Serve index.html for all routes except /api/*
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username already exists
        const [existingUsers] = await pool.query(
            'SELECT * FROM accounts WHERE name = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Generate salt and hash password in PHP's bcrypt format ($2y$)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        const phpBcryptHash = hashedPassword.replace('$2b$', '$2y$');

        // Get current date for various timestamp fields
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];

        // Insert new user with all required fields
        await pool.query(
            `INSERT INTO accounts (
                name, password, pin, pic, loggedin, lastlogin, createdat, birthday, 
                banned, macs, nxCredit, maplePoint, nxPrepaid, characterslots, 
                gender, tempban, greason, tos, sitelogged, webadmin, nick, mute, 
                email, ip, rewardpoints, votepoints, hwid
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                username,           // name
                phpBcryptHash,     // password
                '0000',            // pin
                '',                // pic
                0,                 // loggedin
                currentDate,       // lastlogin
                currentDate,       // createdat
                formattedDate,     // birthday
                0,                 // banned
                '',                // macs
                0,                 // nxCredit
                0,                 // maplePoint
                0,                 // nxPrepaid
                3,                 // characterslots
                0,                 // gender
                currentDate,       // tempban
                0,                 // greason
                0,                 // tos
                0,                 // sitelogged
                0,                 // webadmin
                '',                // nick
                0,                 // mute
                email,             // email
                '',                // ip
                0,                 // rewardpoints
                0,                 // votepoints
                ''                 // hwid
            ]
        );

        res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Example API endpoint
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ success: false, error: 'Database error' });
    }
});

// Export the Express API
module.exports = app;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 