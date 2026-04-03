const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "mysecretkey";

// DB
const db = mysql.createConnection({
  host: 'localhost',
  user: 'appuser',
  password: '123456',
  database: 'hospital_db'
});

db.connect(err => {
  if (err) console.log("DB Error:", err);
  else console.log("MySQL Connected");
});

// AUTH
app.post('/api/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  const hash = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,phone) VALUES (?,?,?,?)",
    [name, email, hash, phone],
    err => {
      if (err) return res.json({ message: "Error" });
      res.json({ message: "User registered successfully" });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM users WHERE email=?", [email], async (err, result) => {
    if (result.length === 0) return res.json({ message: "User not found" });

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.json({ message: "Wrong password" });

    const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

// MIDDLEWARE
function verifyToken(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.json({ message: "Token required" });

  const token = header.split(" ")[1];

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// BOOK
app.post('/api/book', verifyToken, (req, res) => {
  const { doctor_name, appointment_date } = req.body;

  db.query(
    "INSERT INTO appointments (user_email,doctor_name,appointment_date) VALUES (?,?,?)",
    [req.user.email, doctor_name, appointment_date],
    err => {
      if (err) return res.json({ message: "Error booking" });
      res.json({ message: "Appointment booked successfully" });
    }
  );
});

// VIEW
app.get('/api/appointments', verifyToken, (req, res) => {
  db.query(
    "SELECT * FROM appointments WHERE user_email=?",
    [req.user.email],
    (err, result) => {
      res.json(result);
    }
  );
});

// DELETE
app.delete('/api/appointments/:id', verifyToken, (req, res) => {
  db.query(
    "DELETE FROM appointments WHERE id=? AND user_email=?",
    [req.params.id, req.user.email],
    () => res.json({ message: "Deleted" })
  );
});

// UPDATE
app.put('/api/appointments/:id', verifyToken, (req, res) => {
  db.query(
    "UPDATE appointments SET appointment_date=? WHERE id=? AND user_email=?",
    [req.body.appointment_date, req.params.id, req.user.email],
    () => res.json({ message: "Updated" })
  );
});

// REVIEWS
app.post('/api/review', verifyToken, (req, res) => {
  const { doctor_name, rating, comment } = req.body;

  db.query(
    "INSERT INTO reviews (user_email,doctor_name,rating,comment) VALUES (?,?,?,?)",
    [req.user.email, doctor_name, rating, comment],
    () => res.json({ message: "Review added" })
  );
});

app.get('/api/reviews', verifyToken, (req, res) => {
  db.query("SELECT * FROM reviews", (err, result) => {
    res.json(result);
  });
});

app.listen(3000, () => console.log("Server running on port 3000"));