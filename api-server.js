const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'remixms',
    password: 'winter26',
    database: 'v83',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if username exists
        const [existing] = await pool.execute(
            'SELECT * FROM accounts WHERE name = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.execute(
            'INSERT INTO accounts (name, password, email, gm, points, lastlogin, createdate) VALUES (?, ?, ?, 0, 0, ?, ?)',
            [username, hashedPassword, email, new Date(), new Date()]
        );

        res.json({ success: true, message: 'Account created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 