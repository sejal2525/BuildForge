const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'hospital_db'
});

db.connect(err => {
  if (err) {
    console.log('DB Error:', err);
  } else {
    console.log('MySQL Connected');
  }
});

// ================= REGISTER API =================
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validation
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check duplicate email
  const checkSql = "SELECT * FROM users WHERE email = ?";

  db.query(checkSql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertSql = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";

      db.query(insertSql, [name, email, hashedPassword, phone], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        res.json({ message: "User registered successfully" });
      });

    } catch (error) {
      res.status(500).json({ error: "Error hashing password" });
    }
  });
});

// ================= LOGIN API =================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({ message: "Login successful", user: user.email });
  });
});

// ================= START SERVER =================
app.listen(3000, () => {
  console.log('Server running on port 3000');
});