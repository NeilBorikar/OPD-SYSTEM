const API_BASE = window.location.hostname === "localhost" 
  ? "http://localhost:8000" 
  : "https://corepulse-ysxr.onrender.com";

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
export const loginUnified = async (data) => {
  const response = await fetch(`${API_BASE}/login-unified`, {
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

export const loginNurse = async (data) => {
  const response = await fetch(`${API_BASE}/login-nurse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
};

export const loginReceptionist = async (data) => {
  const response = await fetch(`${API_BASE}/login-receptionist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
};

export const loginPatient = async (data) => {
  const response = await fetch(`${API_BASE}/login-patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Invalid credentials");
  return response.json();
};

export const getPatientsOrdered = async () => {
  const response = await fetch(`${API_BASE}/patients/ordered`);
  return response.json();
};

export const getPatientsReception = async () => {
  const response = await fetch(`${API_BASE}/patients/reception`);
  return response.json();
};

export const updatePatient = async (prn, data) => {
  const response = await fetch(`${API_BASE}/patient/${prn}/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return response.json();
};

export const assignTask = async (prn, data) => {
  const response = await fetch(`${API_BASE}/patient/${prn}/assign-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return response.json();
};