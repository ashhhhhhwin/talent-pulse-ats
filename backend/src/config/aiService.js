const axios = require("axios");
const env = require("./env");
const logger = require("../utils/logger");

function resolveAiBaseUrl(url) {
  // Prefer IPv4 loopback so Windows localhost (::1) does not miss an IPv4-only AI server.
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost") parsed.hostname = "127.0.0.1";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

const client = axios.create({
  baseURL: resolveAiBaseUrl(env.aiServiceUrl),
  // Fail fast into Node fallbacks so resume upload stays responsive for demos.
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    logger.error("AI service error", {
      url: err.config?.url,
      status: err.response?.status,
      message: err.message,
    });
    return Promise.reject(err);
  },
);

module.exports = client;
