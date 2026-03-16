const API_BASE = "http://127.0.0.1:8000";

export const registerPatient = async (data) => {

  const response = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};


export const saveConsultation = async (data) => {

  const response = await fetch(`${API_BASE}/consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};


export const getPatientHistory = async (prn) => {

  const response = await fetch(`${API_BASE}/consultation/${prn}`);

  return response.json();
};
export const getPatient = async (prn) => {

  const response = await fetch(`${API_BASE}/patient/${prn}`);

  return response.json();

};
export const loginDoctor = async (data) => {

  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
};


export const resetPassword = async (data) => {

  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Error updating password");
  }

  return response.json();
};

export const registerDoctor = async (data) => {

  const response = await fetch(`${API_BASE}/register-doctor`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
};