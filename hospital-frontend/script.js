const API = "http://localhost:3000/api";

// REGISTER
function register() {
  const nameVal = document.getElementById("name").value;
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  const phoneVal = document.getElementById("phone").value;
  const msg = document.getElementById("msg");
  const btn = document.getElementById("regBtn");

  msg.innerText = "";
  btn.disabled = true;
  btn.innerText = "Registering...";

  if (!nameVal || !emailVal || !passVal || !phoneVal) {
    msg.innerText = "All fields are required!";
    msg.style.color = "red";
    btn.disabled = false;
    btn.innerText = "Register";
    return;
  }

  fetch(API + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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
    msg.style.color = data.message.includes("success") ? "green" : "red";
  })
  .catch(() => {
    msg.innerText = "Server error!";
    msg.style.color = "red";
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerText = "Register";
  });
}


// LOGIN
function login() {
  const emailVal = document.getElementById("email").value;
  const passVal = document.getElementById("password").value;
  const msg = document.getElementById("msg");
  const btn = document.getElementById("loginBtn");

  msg.innerText = "";
  btn.disabled = true;
  btn.innerText = "Logging in...";

  if (!emailVal || !passVal) {
    msg.innerText = "Enter email and password";
    msg.style.color = "red";
    btn.disabled = false;
    btn.innerText = "Login";
    return;
  }

  fetch(API + "/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: emailVal,
      password: passVal
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.token) {
      localStorage.setItem("token", data.token);

      msg.innerText = "Login successful ✅";
      msg.style.color = "green";

      setTimeout(() => {
        window.location = "dashboard.html";
      }, 1000);
    } else {
      msg.innerText = data.message;
      msg.style.color = "red";
    }
  })
  .catch(() => {
    msg.innerText = "Server error!";
    msg.style.color = "red";
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerText = "Login";
  });
}