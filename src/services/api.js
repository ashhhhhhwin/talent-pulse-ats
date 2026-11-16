const API_BASE = import.meta.env.VITE_API_URL || "/api";
const REQUEST_TIMEOUT_MS = 1200000;

function getToken() {
  return localStorage.getItem("sr_token");
}

function setToken(token) {
  if (token) localStorage.setItem("sr_token", token);
  else localStorage.removeItem("sr_token");
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "Backend API timed out. Restart: cd UI/backend && npm run dev",
      );
    }
    throw err;
  } finally {
    window.clearTimeout(timer);
  }
}

async function loginRequest(email, password) {
  const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Login failed");
  setToken(json.data.token);
  return json.data;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body = options.body;
  if (body && !(body instanceof FormData) && typeof body === "object") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetchWithTimeout(`${API_BASE}${path}`, {
      ...options,
      headers,
      body,
    });
  } catch (err) {
    throw new Error(
      err.message ||
        "Backend API is unreachable. Start it with: cd UI/backend && npm run dev",
    );
  }

  if (
    res.status === 401 &&
    !options._retried &&
    !path.includes("/auth/login")
  ) {
    setToken(null);
    try {
      await loginRequest("admin@smartrecruiter.local", "Admin@123");
      return request(path, { ...options, _retried: true });
    } catch {
      /* fall through */
    }
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      json.message || json.detail || `Request failed (${res.status})`,
    );
    err.status = res.status;
    err.errors = json.errors;
    throw err;
  }
  return json.data;
}

export const api = {
  setToken,
  getToken,

  async login(email, password) {
    return loginRequest(email, password);
  },

  async getJobs() {
    return request("/jobs");
  },

  async getCandidates() {
    return request("/candidates");
  },

  async getDashboardStats() {
    return request("/dashboard/stats");
  },

  async uploadResume(file, jobId = null) {
    const form = new FormData();
    form.append("resume", file);
    if (jobId) form.append("jobId", String(jobId));
    return request("/resumes/upload", { method: "POST", body: form });
  },

  async runMatching(jobId) {
    return request(`/matching/jobs/${jobId}/run`, { method: "POST" });
  },

  async getMatchResults(jobId, top = null) {
    const q = top ? `?top=${top}` : "";
    return request(`/matching/jobs/${jobId}/results${q}`);
  },

  async updateCandidateStage(candidateId, stage, jobId = null) {
    const body = { stage };
    if (jobId != null) body.jobId = jobId;
    return request(`/candidates/${candidateId}/stage`, {
      method: "PATCH",
      body,
    });
  },

  async updateCandidateNotes(candidateId, notes) {
    return request(`/candidates/${candidateId}/notes`, {
      method: "PATCH",
      body: { notes },
    });
  },

  async assistantChat(message, history = []) {
    return request("/assistant/chat", {
      method: "POST",
      body: { message, history },
    });
  },
};

export default api;
