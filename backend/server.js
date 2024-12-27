const bcrypt = require('bcrypt');
const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise'); 
const app = express();
const cors = require('cors');
dotenv.config();


app.use(cors());  // Enable CORS for all routes
app.use(express.json());

app.use(cors({
    origin: 'http://localhost:3000'  // Allow only requests from this frontend
}));

// MySQL connection setup
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Helper function to map camelCase to snake_case
const toSnakeCase = (obj) => {
    const result = {};
    for (const key in obj) {
        const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        result[snakeKey] = obj[key];
    }
    return result;
};

// Registration Route
app.post('/register', async (req, res) => {
    let { firstName, lastName, mobileNumber, password } = req.body;

    try {
        // Check for required fields
        if (!firstName || !lastName || !mobileNumber || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Map the body to snake_case for the database
        const user = toSnakeCase({
            firstName,
            lastName,
            mobileNumber,
            password: hashedPassword
        });

        // Raw SQL query to register user
        const [result] = await pool.query(
            'INSERT INTO users (first_name, last_name, mobile_number, password) VALUES (?, ?, ?, ?)',
            [user.first_name, user.last_name, user.mobile_number, user.password]
        );

        // Send a success response
        res.status(201).json({
            message: 'User registered successfully',
            userId: result.insertId
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login Route (check password)
app.post('/login', async (req, res) => {
    const { mobileNumber, password } = req.body;

    try {
        if (!mobileNumber || !password) {
            return res.status(400).json({ error: 'Mobile number and password are required' });
        }

        // Check if user exists
        const [rows] = await pool.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare hashed password with the one stored in the database
        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // If password is valid, send success response
        res.json({ message: 'Login successful', userId: user.id, userName: user.firstName });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT API: Update a User
app.put('/user/:id', async (req, res) => {
    const { id } = req.params;
    let { firstName, lastName, mobileNumber, password } = req.body;

    try {
        // Check if any fields are provided for update
        if (!firstName && !lastName && !mobileNumber && !password) {
            return res.status(400).json({ error: 'At least one field must be provided to update' });
        }

        // Hash password if provided
        let hashedPassword;
        if (password) {
            const saltRounds = 10;
            hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Map the body to snake_case for the database
        const user = toSnakeCase({
            firstName,
            lastName,
            mobileNumber,
            password: hashedPassword
        });

        // Raw SQL query to update user
        await pool.query('UPDATE users SET first_name = ?, last_name = ?, mobile_number = ?, password = ? WHERE id = ?', [
            user.first_name || null, 
            user.last_name || null, 
            user.mobile_number || null, 
            user.password || null,
            id
        ]);

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error during user update:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE API: Delete a User
app.delete('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Raw SQL query to delete user
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error during user deletion:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET API: Get a specific user
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Raw SQL query to get user by ID
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(rows[0]); // Return the first result (there should be only one)
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
