const API_BASE = "https://corepulse-ysxr.onrender.com";

export const loginPatient = async (data) => {
  const response = await fetch(`${API_BASE}/login-patient-universal`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
};

export const getUniversalHistory = async (prn) => {
  const response = await fetch(`${API_BASE}/consultation/universal/${prn}`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};

export const getTimeline = async (prn) => {
  const response = await fetch(`${API_BASE}/ai/timeline/${prn}`);
  if (!response.ok) throw new Error('Failed to fetch timeline');
  return response.json();
};

export const getSummary = async (prn) => {
  const response = await fetch(`${API_BASE}/ai/summary/${prn}`);
  if (!response.ok) throw new Error('Failed to fetch summary');
  return response.json();
};

export const getTrends = async (prn) => {
  const response = await fetch(`${API_BASE}/ai/trends/${prn}`);
  if (!response.ok) throw new Error('Failed to fetch trends');
  return response.json();
};

export const askRecords = async (prn, question, history = []) => {
  const response = await fetch(`${API_BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prn, question, history })
  });
  if (!response.ok) throw new Error('Failed to ask question');
  return response.json();
};

export const getReport = async (prn) => {
  const response = await fetch(`${API_BASE}/ai/report/${prn}`);
  if (!response.ok) throw new Error('Failed to fetch report');
  return response.json();
};