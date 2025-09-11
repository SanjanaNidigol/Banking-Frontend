// src/js/services/auth.service.js
define([], function () {
  const BASE = "/api/users"; // proxy in oraclejetconfig forwards to 8081

  return {
    register: async function (payload) {
      const res = await fetch(`${BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Registration failed");
      }
      return res.json();
    },

    login: async function (payload) {
      const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }
      return res.json();
    }
  };
});
