const express = require("express");
const path = require("path");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key", // Replace with a secure key
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to enforce Loadscreen.html
app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/Loadscreen.html") {
    req.session.visitedLoadscreen = true;
    return next();
  }
  if (!req.session.visitedLoadscreen) {
    console.log("Redirecting to Loadscreen.html");
    return res.redirect("/");
  }
  next();
});

// Default route → Loadscreen
app.get("/", (req, res) => {
  console.log("Serving Loadscreen.html");
  res.sendFile(path.join(__dirname, "public", "Loadscreen.html"));
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// 🟢 Dummy user store (replace with database later)
const users = [];

// Password validation
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

// 🟣 Handle registration
app.post("/register", (req, res) => {
  const { fullname, username, email, password, confirm_password } = req.body;

  // Validate required fields
  if (!fullname || !username || !email || !password || !confirm_password) {
    return res.status(400).send("⚠️ All fields are required");
  }

  // Check if passwords match
  if (password !== confirm_password) {
    return res.status(400).send("⚠️ Passwords do not match");
  }

  // Validate password strength
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).send(`⚠️ ${passwordError}`);
  }

  // Check if username or email already exists
  if (users.find((u) => u.username === username)) {
    return res.status(400).send("⚠️ Username already taken");
  }
  if (users.find((u) => u.email === email)) {
    return res.status(400).send("⚠️ Email already registered");
  }

  // Save new user
  users.push({ fullname, username, email, password });
  console.log("✅ New user registered:", username, email);

  // Later: send verification code via email here
  // e.g., sendVerificationEmail(email);

  res.redirect("/login.html");
});

// 🟢 Handle login using username + password only
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check required fields
  if (!username || !password) {
    return res.status(400).send("⚠️ Username and password are required");
  }

  // Verify user credentials
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).send("❌ Invalid username or password");
  }

  console.log("🔑 Login successful:", username);

  // Redirect to main index page
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Vendora running at http://localhost:${PORT}`);
});