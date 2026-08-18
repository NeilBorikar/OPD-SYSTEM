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
