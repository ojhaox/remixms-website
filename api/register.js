const pool = require('../config/database');
const bcrypt = require('bcrypt');

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, password, email } = req.body;

    try {
        // Test database connection first
        const connection = await pool.getConnection();
        connection.release();

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
        // Send more detailed error information
        res.status(500).json({ 
            error: 'Registration failed',
            details: error.message,
            code: error.code
        });
    }
}; 