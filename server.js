require('dotenv').config(); 
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;
const SECRET_KEY = 'your_super_secret_key_change_this'; // In production, use environment variable

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.redirect('/login');
        req.user = user;
        next();
    });
};

// Routes

// Auth Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) return res.redirect('/login');

        const user = results[0];
        if (bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true });
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(query, [username, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.redirect('/register');
        }
        res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Task Routes (Protected)
app.get('/', authenticateToken, (req, res) => {
    console.log('GET / hit');
    console.log('User:', req.user);

    // Filter by user and hide tasks completed > 6 hours ago
    const query = `
        SELECT * FROM tasks 
        WHERE user_id = ? 
        AND (is_completed = FALSE OR completed_at > NOW() - INTERVAL 6 HOUR)
        ORDER BY created_at DESC
    `;
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
            return;
        }
        console.log('Rendering index with user:', req.user);
        res.render('index', { tasks: results, user: req.user });
    });
});

app.post('/add', authenticateToken, (req, res) => {
    const task = req.body.task;
    if (!task) {
        res.redirect('/');
        return;
    }
    const query = 'INSERT INTO tasks (task, user_id) VALUES (?, ?)';
    db.query(query, [task, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
            return;
        }
        res.redirect('/');
    });
});

// Toggle Complete
app.post('/complete/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const isCompleted = req.body.completed === 'true';
    const completedAt = isCompleted ? new Date() : null;

    const query = 'UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?';
    db.query(query, [isCompleted, completedAt, id, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
            return;
        }
        res.json({ success: true }); // Respond with JSON for AJAX
    });
});

// Edit/Delete (Optional, keeping for completeness but adapting)
app.get('/delete/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
    db.query(query, [id, req.user.id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Database error');
            return;
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
