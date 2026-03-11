const API_BASE = "https://opd-system-6e5p.onrender.com";

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