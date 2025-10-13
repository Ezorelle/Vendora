import request from "./index.js";

export const login = (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
export const logout = () => request("/auth/logout", { method: "POST" });
export const refreshToken = () => request("/auth/refresh", { method: "POST" });
export const currentUser = () => request("/auth/me");
