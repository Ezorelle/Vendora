const request = require("./index.js");

const login = (email, password) =>
  request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

const logout = () => request("/auth/logout", { method: "POST" });

const refreshToken = () => request("/auth/refresh", { method: "POST" });

const currentUser = () => request("/auth/me");

module.exports = {
  login,
  logout,
  refreshToken,
  currentUser,
};
