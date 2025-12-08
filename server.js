require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

// ----------------------------
// 📦 ENV VARIABLES
// ----------------------------
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const SESSION_SECRET = process.env.SESSION_SECRET || "fallback_secret_key";


const User = require("./models/Usermodel");
const Seller = require("./models/Sellermodel");
const Product = require("./models/Productmodel");



// 🧩 ROUTERS //

const productsRouter = require("./src/api/products");
const ordersRouter   = require("./src/api/orders");
const paymentsRouter = require("./src/api/payments");
const invoicesRouter = require("./src/api/invoices");
const webhooksRouter = require("./src/api/webhooks");


// ⚙️ DATABASE CONNECTION //

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔧 MIDDLEWARE  // 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3 * 60 * 60 * 1000 }, // 3 hours
  })
);

// ----------------------------
// 🌐 STATIC FILES
// ----------------------------
app.use(express.static(path.join(__dirname, "public")));

// ----------------------------
// 🚀 LOADSCREEN
// ----------------------------
app.get("/", (req, res) => {
  if (!req.session.visitedLoadscreen) {
    req.session.visitedLoadscreen = true;
    return res.sendFile(path.join(__dirname, "public", "Loadscreen.html"));
  }
  res.redirect("/index.html");
});

// ----------------------------
// 🔒 PASSWORD VALIDATION
// ----------------------------
const validatePassword = (password) => {
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-zA-Z]/.test(password)) return "Password must contain at least one letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  return null;
};

// ----------------------------
// 👤 USER REGISTRATION
// ----------------------------
app.post("/register", async (req, res) => {
  try {
    const { fullname, username, email, password, confirm_password } = req.body;

    if (!fullname || !username || !email || !password || !confirm_password)
      return res.status(400).send("⚠️ All fields are required");

    if (password !== confirm_password)
      return res.status(400).send("⚠️ Passwords do not match");

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).send(`⚠️ ${passwordError}`);

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser)
      return res.status(400).send("⚠️ Username or email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      fullname,
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    console.log("✅ New user registered:", username);
    res.redirect("/login.html");
  } catch (err) {
    console.error("❌ Error registering user:", err);
    res.status(500).send("⚠️ Server error while registering");
  }
});

// ----------------------------
// 🏪 SELLER REGISTRATION
// ----------------------------
app.post("/seller/register", async (req, res) => {
  try {
    const { fullname, shopname, email, password, confirm_password } = req.body;

    if (!fullname || !shopname || !email || !password || !confirm_password)
      return res.status(400).send("⚠️ All fields are required");

    if (password !== confirm_password)
      return res.status(400).send("⚠️ Passwords do not match");

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).send(`⚠️ ${passwordError}`);

    const existingSeller = await Seller.findOne({
      $or: [{ shopname }, { email }],
    });
    if (existingSeller)
      return res.status(400).send("⚠️ Shop name or email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    await Seller.create({
      fullname,
      shopname,
      email,
      password: hashedPassword,
      role: "seller",
    });

    console.log("✅ New seller registered:", shopname);
    res.redirect("/seller_login.html");
  } catch (err) {
    console.error("❌ Error registering seller:", err);
    res.status(500).send("⚠️ Server error while registering seller");
  }
});

// ----------------------------
// 🔑 LOGIN (user & seller)
// ----------------------------
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "Username and password are required" });

    let account;

    if (role === "seller") {
      account = await Seller.findOne({
        $or: [{ shopname: username }, { email: username }],
      });
    } else {
      account = await User.findOne({
        $or: [{ username }, { email: username }],
      });
    }

    if (!account)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    req.session.user = {
      fullname: account.fullname,
      username: account.username || account.shopname,
      email: account.email,
      balance: account.balance || 0,
      role: account.role,
    };

    console.log(`🔑 Login successful: ${req.session.user.username}`);
    res.json({ message: "Login successful", role: account.role });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ----------------------------
// 📦 FETCH SESSION USER
// ----------------------------
app.get("/api/user", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ message: "Not logged in" });
  res.json(req.session.user);
});

// ----------------------------
// 🚪 LOGOUT
// ----------------------------
app.post("/api/auth/logout", (req, res) => {
  if (req.session.user) {
    console.log("🚪 Logging out:", req.session.user.username);
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Error logging out" });

      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  } else {
    res.status(400).json({ message: "No active session" });
  }
});

// ----------------------------
// 🧩 API ROUTES
// ----------------------------
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/webhook", webhooksRouter);


// 🚀 START SERVER //

app.listen(PORT, () => {
  console.log(`🚀 Vendora running at http://localhost:${PORT}`);
});
