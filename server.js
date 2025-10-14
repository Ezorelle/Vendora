// ----------------------
// Vendora Server
// ----------------------
const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------
// Middleware
// ----------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Enforce Loadscreen page for first-time visits
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

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, "public")));

// ----------------------
// Authentication (temporary dummy logic)
// ----------------------
const users = [];

// Validate password strength
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

// Registration route
app.post("/register", (req, res) => {
  const { fullname, username, email, password, confirm_password } = req.body;

  if (!fullname || !username || !email || !password || !confirm_password) {
    return res.status(400).send("⚠️ All fields are required");
  }
  if (password !== confirm_password) {
    return res.status(400).send("⚠️ Passwords do not match");
  }

  const passwordError = validatePassword(password);
  if (passwordError) return res.status(400).send(`⚠️ ${passwordError}`);

  if (users.find((u) => u.username === username))
    return res.status(400).send("⚠️ Username already taken");
  if (users.find((u) => u.email === email))
    return res.status(400).send("⚠️ Email already registered");

  users.push({ fullname, username, email, password });
  console.log("✅ New user registered:", username);
  res.redirect("/login.html");
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).send("⚠️ Username and password are required");

  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).send("❌ Invalid username or password");

  console.log("🔑 Login successful:", username);
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ----------------------
// API Controllers (Corrected paths)
// ----------------------
const productsRouter = require("./src/api/products");
const ordersRouter = require("./src/api/orders");
const paymentsRouter = require("./src/api/payments");
const invoicesRouter = require("./src/api/invoices");
const webhooksRouter = require("./src/api/webhooks");

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/webhook", webhooksRouter);

// ----------------------
// Default route
// ----------------------
app.get("/", (req, res) => {
  console.log("Serving Loadscreen.html");
  res.sendFile(path.join(__dirname, "public", "Loadscreen.html"));
});

// ----------------------
// Start server
// ----------------------
app.listen(PORT, () => {
  console.log(`✅ Vendora running at http://localhost:${PORT}`);
});
