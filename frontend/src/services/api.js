const API_BASE = "https://corepulse-ysxr.onrender.com";

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

export const completeTask = async (taskId) => {
  const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
    method: "PUT"
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to complete task");
  }
  return response.json();
};

export const getNurseTasks = async (username, status = null, date = null) => {
  let url = `${API_BASE}/tasks/nurse/${username}`;
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (date) params.append("date", date);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch nurse tasks");
  return response.json();
};

export const completeSlot = async (slotId) => {
  const response = await fetch(`${API_BASE}/slots/${slotId}/complete`, {
    method: "PUT"
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to complete slot");
  }
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

export const setDoctorSession = async (data) => {
  const response = await fetch(`${API_BASE}/slots/set-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to set session");
  }
  return response.json();
};

export const getSlots = async (date = null, doctorUsername = null) => {
  let url = `${API_BASE}/slots/`;
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (doctorUsername) params.append("doctor_username", doctorUsername);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  const response = await fetch(url);
  return response.json();
};

export const getDoctors = async () => {
  const response = await fetch(`${API_BASE}/slots/doctors`);
  if (!response.ok) throw new Error("Failed to fetch doctors");
  return response.json();
};

export const bookSlot = async (slotId, patientPrn) => {
  const response = await fetch(`${API_BASE}/slots/book?slot_id=${slotId}&patient_prn=${patientPrn}`, {
    method: "POST"
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Booking failed");
  }
  return response.json();
};

export const getLiveQueueStatus = async (prn) => {
  const response = await fetch(`${API_BASE}/slots/live-queue/${prn}`);
  if (!response.ok) throw new Error("Failed to fetch live queue status");
  return response.json();
};

export const createPatientQuery = async (data) => {
  const response = await fetch(`${API_BASE}/queries/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to submit query");
  return response.json();
};

export const getPatientQueries = async (prn) => {
  const response = await fetch(`${API_BASE}/queries/patient/${prn}`);
  if (!response.ok) throw new Error("Failed to fetch patient queries");
  return response.json();
};

export const getStaffQueries = async () => {
  const response = await fetch(`${API_BASE}/queries/staff`);
  if (!response.ok) throw new Error("Failed to fetch staff queries");
  return response.json();
};

export const getDoctorQueries = async (doctorUsername) => {
  const response = await fetch(`${API_BASE}/queries/doctor/${doctorUsername}`);
  if (!response.ok) throw new Error("Failed to fetch doctor queries");
  return response.json();
};

export const answerQuery = async (queryId, data) => {
  const response = await fetch(`${API_BASE}/queries/${queryId}/answer`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to answer query");
  return response.json();
};

export const forwardQuery = async (queryId, data) => {
  const response = await fetch(`${API_BASE}/queries/${queryId}/forward`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error("Failed to forward query");
  return response.json();
};
export const getClinics = async () => {
  const response = await fetch(`${API_BASE}/AEGIS@12250510/clinics`);
  if (!response.ok) throw new Error('Failed to fetch clinics');
  return response.json();
};
