// ─────────────────────────────────────────────────────────────────────────────
// api.js — central fetch wrapper for the INTI FYP backend
// All requests go through /api/* which Vite proxies to localhost:3000
// ─────────────────────────────────────────────────────────────────────────────

const BASE = '/api'

function getToken() {
  return localStorage.getItem('fyp_token')
}

function authHeaders(extra = {}) {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || data.error || `HTTP ${res.status}`)
    err.status  = res.status
    err.code    = data.error   // e.g. 'pending', 'deactivated'
    err.data    = data
    throw err
  }
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(res)
  },

  async register(data) {
    const res = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async me() {
    const res = await fetch(`${BASE}/auth/me`, { headers: authHeaders() })
    return handleResponse(res)
  },

  // Users (admin)
  async getUsers(params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${BASE}/users${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async createUser(data) {
    const res = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async approveUser(id, departmentId) {
    const res = await fetch(`${BASE}/users/${id}/approve`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ departmentId }),
    })
    return handleResponse(res)
  },

  async rejectUser(id) {
    const res = await fetch(`${BASE}/users/${id}/reject`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async deactivateUser(id) {
    const res = await fetch(`${BASE}/users/${id}/deactivate`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async reactivateUser(id) {
    const res = await fetch(`${BASE}/users/${id}/reactivate`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async updateUser(id, data) {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async updatePassword(id, data) {
    const res = await fetch(`${BASE}/users/${id}/password`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // Departments
  async getDepartments() {
    const res = await fetch(`${BASE}/users/departments`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async createDepartment(name) {
    const res = await fetch(`${BASE}/users/departments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    })
    return handleResponse(res)
  },

  async deleteDepartment(id) {
    const res = await fetch(`${BASE}/users/departments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  // Proposals
  async getProposals(params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${BASE}/proposals${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async getProposalById(id) {
    const res = await fetch(`${BASE}/proposals/${id}`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async createProposal(data) {
    const res = await fetch(`${BASE}/proposals`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async approveProposal(id, feedback) {
    const res = await fetch(`${BASE}/proposals/${id}/approve`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    })
    return handleResponse(res)
  },

  async rejectProposal(id, feedback) {
    const res = await fetch(`${BASE}/proposals/${id}/reject`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ feedback }),
    })
    return handleResponse(res)
  },

  async updateProposalDept(id, departmentId) {
    const res = await fetch(`${BASE}/proposals/${id}/department`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ departmentId }),
    })
    return handleResponse(res)
  },

  // Proposal selection (student)
  async selectProposal(proposalId) {
    const res = await fetch(`${BASE}/proposals/${proposalId}/select`, {
      method: 'POST',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async dropProposal(proposalId) {
    const res = await fetch(`${BASE}/proposals/${proposalId}/drop`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async getMySelection() {
    const res = await fetch(`${BASE}/proposals/my-selection`, { headers: authHeaders() })
    return handleResponse(res)
  },

  // Teams
  async getTeams() {
    const res = await fetch(`${BASE}/teams`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async getMyTeam() {
    const res = await fetch(`${BASE}/teams/mine`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async createTeam(data) {
    const res = await fetch(`${BASE}/teams`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  async updateTeam(teamId, name) {
    const res = await fetch(`${BASE}/teams/${teamId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    })
    return handleResponse(res)
  },

  async deleteTeam(teamId) {
    const res = await fetch(`${BASE}/teams/${teamId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async assignMembers(teamId, studentIds, leaderId) {
    const res = await fetch(`${BASE}/teams/${teamId}/assign`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ studentIds, leaderId }),
    })
    return handleResponse(res)
  },

  async linkProposal(teamId, proposalId) {
    const res = await fetch(`${BASE}/teams/${teamId}/link-proposal`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ proposalId }),
    })
    return handleResponse(res)
  },

  async unlinkProposal(teamId) {
    const res = await fetch(`${BASE}/teams/${teamId}/link-proposal`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async confirmTeam(teamId) {
    const res = await fetch(`${BASE}/teams/${teamId}/confirm`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  // Chat
  async getChatThread(proposalId) {
    const res = await fetch(`${BASE}/chat/${proposalId}`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async sendMessage(proposalId, message) {
    const res = await fetch(`${BASE}/chat/${proposalId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ message }),
    })
    return handleResponse(res)
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${BASE}/notifications`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async getUnreadCount() {
    const res = await fetch(`${BASE}/notifications/unread-count`, { headers: authHeaders() })
    return handleResponse(res)
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    })
    return handleResponse(res)
  },

  async createNotification(data) {
    const res = await fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(res)
  },

  // Audit log
  async getAuditLogs(params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await fetch(`${BASE}/audit${qs ? `?${qs}` : ''}`, { headers: authHeaders() })
    return handleResponse(res)
  },

  // Reports
  async getReports() {
    const res = await fetch(`${BASE}/reports`, { headers: authHeaders() })
    return handleResponse(res)
  },

  // Dept students (for team assignment)
  async getDeptStudents() {
    const res = await fetch(`${BASE}/users/dept-students`, { headers: authHeaders() })
    return handleResponse(res)
  },
}
