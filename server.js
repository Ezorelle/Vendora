const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (req.path === "/" || req.path === "/Loadscreen.html") {
    req.session.visitedLoadscreen = true;
    return res.sendFile(path.join(__dirname, "public", "Loadscreen.html"));
  }
  if (!req.session.visitedLoadscreen) {
    return res.redirect("/");
  }
  next();
});

const users = [];

const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

app.post("/register", (req, res) => {
  const { fullname, username, email, password, confirm_password } = req.body;
  if (!fullname || !username || !email || !password || !confirm_password)
    return res.status(400).send("⚠️ All fields are required");
  if (password !== confirm_password)
    return res.status(400).send("⚠️ Passwords do not match");

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


// --- LOGIN ROUTE ---
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Store user session for 3 hours
  req.session.user = { username: user.username, email: user.email };
  req.session.cookie.maxAge = 3 * 60 * 60 * 1000; // in ms

  console.log("🔑 Login successful:", username);

  res.json({
    message: "Login successful",
    role: "buyer", // or seller later when roles exist
    username: user.username,
  });
});

// --- LOGOUT ROUTE ---
app.post("/api/auth/logout", (req, res) => {
  if (req.session.user) {
    console.log("🚪 Logging out:", req.session.user.username);
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid"); // Clear the session cookie
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.status(400).json({ message: "No active session" });
  }
});

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

app.listen(PORT, () => {
  console.log(`✅ Vendora running at http://localhost:${PORT}`);
});
