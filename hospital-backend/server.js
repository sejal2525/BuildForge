const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// 🟢 MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123', // 🔥 change this
  database: 'hospital_db'
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});


// 🟢 REGISTER API
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, phone], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "User registered successfully" });
    });

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// 🟢 LOGIN API (JWT)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ?";

  db.query(sql, [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token
    });
  });
});


// 🟢 VERIFY TOKEN MIDDLEWARE
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: "Token required" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  });
}


// 🟢 PROTECTED TEST ROUTE
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});


// 🟢 TASK 6: REAL PROTECTED ROUTE
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    email: req.user.email
  });
});


// 🟢 SERVER START
app.listen(3000, () => {
  console.log("Server running on port 3000");
});