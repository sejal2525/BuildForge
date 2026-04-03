const API = "http://localhost:3000/api";

// REGISTER
function register() {
  const nameVal = document.getElementById("name").value;
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  const phoneVal = document.getElementById("phone").value;
  const msg = document.getElementById("msg");

  fetch(API + "/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      name: nameVal,
      email: emailVal,
      password: passVal,
      phone: phoneVal
    })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerText = data.message;
  });
}


// LOGIN
function login() {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  const msg = document.getElementById("msg");

  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      email: emailVal,
      password: passVal
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location = "dashboard.html";
    } else {
      msg.innerText = data.message;
    }
  });
}


// BOOK
function book() {
  const doctor = document.getElementById("doctor").value;
  const date = document.getElementById("date").value;
  const msg = document.getElementById("msg");

  const token = localStorage.getItem("token");

  fetch(API + "/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      doctor_name: doctor,
      appointment_date: date
    })
  })
  .then(res => res.json())
  .then(data => {
    msg.innerText = data.message;
    loadAppointments();
  });
}


// LOAD
function loadAppointments() {
  const list = document.getElementById("list");
  const token = localStorage.getItem("token");

  list.innerHTML = "Loading...";

  fetch(API + "/appointments", {
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    list.innerHTML = "";

    data.forEach(a => {
      const li = document.createElement("li");

      const formattedDate = new Date(a.appointment_date).toLocaleDateString();

      li.innerHTML = `
        ${a.doctor_name} - ${formattedDate}
        <button onclick="deleteAppointment(${a.id})">❌</button>
        <button onclick="reschedule(${a.id})">✏️</button>
      `;

      list.appendChild(li);
    });
  });
}


// DELETE
function deleteAppointment(id) {
  const token = localStorage.getItem("token");

  fetch(API + "/appointments/" + id, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + token
    }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadAppointments();
  });
}


// 🔥 RESCHEDULE
function reschedule(id) {
  const newDate = prompt("Enter new date (YYYY-MM-DD)");

  if (!newDate) return;

  const token = localStorage.getItem("token");

  fetch(API + "/appointments/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      appointment_date: newDate
    })
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    loadAppointments();
  });
}