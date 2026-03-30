const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// ================= DATABASE =================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123', // 🔥 change this
  database: 'hospital_db'
});

db.connect(err => {
  if (err) {
    console.log("DB Error:", err);
  } else {
    console.log("MySQL Connected");
  }
});


// ================= AUTH =================

// REGISTER
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Email already exists" });
          }
          return res.status(500).json({ message: "Database error" });
        }

        res.json({ message: "User registered successfully" });
      }
    );

  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: "1h" });

    res.json({
      message: "Login successful",
      token: token
    });
  });
});


// ================= MIDDLEWARE =================

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


// ================= TEST ROUTES =================

// PROFILE
app.get('/api/profile', verifyToken, (req, res) => {
  res.json({
    message: "User profile fetched successfully",
    email: req.user.email
  });
});


// ================= APPOINTMENTS =================

// 🔥 BOOK APPOINTMENT
app.post('/api/book', verifyToken, (req, res) => {
  const { doctor_name, appointment_date } = req.body;
  const user_email = req.user.email;

  if (!doctor_name || !appointment_date) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query(
    "INSERT INTO appointments (user_email, doctor_name, appointment_date) VALUES (?, ?, ?)",
    [user_email, doctor_name, appointment_date],
    (err) => {
      if (err) {
        console.log("DB ERROR:", err);
        return res.status(500).json({ message: "Booking failed" });
      }

      res.json({ message: "Appointment booked successfully" });
    }
  );
});


// 🔥 VIEW APPOINTMENTS
app.get('/api/appointments', verifyToken, (req, res) => {
  const user_email = req.user.email;

  db.query(
    "SELECT * FROM appointments WHERE user_email = ?",
    [user_email],
    (err, result) => {
      if (err) {
        console.log("FETCH ERROR:", err);
        return res.status(500).json({ message: "Error fetching appointments" });
      }

      res.json(result);
    }
  );
});


// 🔥 DELETE APPOINTMENT
app.delete('/api/appointments/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const user_email = req.user.email;

  const sql = "DELETE FROM appointments WHERE id = ? AND user_email = ?";

  db.query(sql, [id, user_email], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting appointment" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found or unauthorized" });
    }

    res.json({ message: "Appointment deleted successfully" });
  });
});


// ================= SERVER =================

app.listen(3000, () => {
  console.log("Server running on port 3000");
});