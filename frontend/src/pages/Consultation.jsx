import { useState } from "react";
import "../index.css";
import { saveConsultation } from "../services/api";
import { getPatient } from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
function Consultation() {

  const [medicines, setMedicines] = useState([
    { name: "", dose: "" }
  ]);

  const addMedicine = () => {
    setMedicines([...medicines, { name: "", dose: "" }]);
  };
  const [formData, setFormData] = useState({
    patient_name: "",
    age: "",
    gender: "",
    address: "",
    prn: "",

    bp: "",
    pulse: "",
    spo2: "",
    weight: "",
    height: "",
    bmi: "",

    complaints: "",
    examination: "",
    past_history: "",
    allergy: "",
    diagnosis: "",

    advice: "",
    investigations: "",
    severityIndex: "normal"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {

    const payload = {
      ...formData,
      medicines
    };

    try {

      const res = await saveConsultation(payload);

      alert("Consultation Saved");

      console.log(res);

    } catch (error) {

      console.error(error);
      alert("Error saving consultation");

    }

  };

  const fetchPatient = async (prn) => {

  try {

    const data = await getPatient(prn);

    if (data.message !== "Patient not found") {

      setFormData((prev) => ({
        ...prev,
        patient_name: data.name,
        age: data.age,
        gender: data.sex,
        address: data.address
      }));

    }

  } catch (error) {
    console.error(error);
  }

};
const pdfRef = useRef();

const handleDownloadPDF = async () => {

  const input = pdfRef.current;

  const canvas = await html2canvas(input, {
    scale: 2,            // ⭐ ultra clarity
    useCORS: true,
    scrollY: -window.scrollY
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  pdf.save(`Prescription_${Date.now()}.pdf`);

};

  return (
    <div className="page-wrapper">

      <div className="prescription-paper" ref={pdfRef}>

        

        

        <hr/>

        <h3 className="section-title">OPD Consultation Sheet</h3>
        <div className="patient-info-container">
          <div className="patient-info-left">
            <p><b>Patient Name :</b> <input
            name="patient_name"
            className="line-input"
            value={formData.patient_name}
            onChange={handleChange}
            /></p>
            <p><b>Age :</b> <input name="age" className="small-input" value={formData.age} onChange={handleChange}/></p>
            <p><b>Gender :</b> <input name="gender" className="small-input" value={formData.gender} onChange={handleChange}/></p>
            <p><b>Address :</b> <input
              name="address"
              className="line-input"
              value={formData.address}
              onChange={handleChange}
            /></p>
            <p><b>PRN / PSN :</b> <input
            name="prn"
            className="line-input"
            value={formData.prn}
            onChange={(e) => {
            handleChange(e);
            fetchPatient(e.target.value);
            }}
            /></p>
          </div>

          <div className="patient-info-right">
            <p><b>Severity Index :</b> 
              <select 
                name="severityIndex" 
                value={formData.severityIndex} 
                onChange={handleChange}
                style={{marginLeft: "10px", padding: "5px"}}
              >
                <option value="normal">Normal</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </p>
            <p><b>Department :</b> Neurosurgery</p>
            <p><b>Consultation Date :</b> <input type="date"/></p>
            <p><b>Consultant :</b> Dr. Rakesh Kumar Das</p>
            <p>MBBS,MS,M.Ch.(Neurosurgery)</p>
            <p>Reg No-102761(WBMC)</p>
            <p>Consultant Brain & Spine Surgeon</p>
            {/* <p>Subham Hospital & Diagnotic Centre Pvt Ltd</p> */}
          </div>              
        </div>
        {/* VITALS */}

        <div className="vitals">

          <div>
            <p>BP : <input name="bp"className="small-input" value={formData.bp}onChange={handleChange}/></p>
            <p>Pulse Rate : <input name="pulse" className="small-input" value={formData.pulse} onChange={handleChange}/></p>
            <p>SPO2 : <input name="spo2" className="small-input" value={formData.spo2} onChange={handleChange}/></p>
          </div>

          <div>
            <p>Weight : <input name="weight" className="small-input" value={formData.weight} onChange={handleChange}/></p>
            <p>Height : <input name="height" className="small-input" value={formData.height} onChange={handleChange}/></p>
            <p>BMI : <input name="bmi" className="small-input" value={formData.bmi} onChange={handleChange}/></p>
          </div>

        </div>

        {/* CLINICAL NOTES */}

        <div className="section">
          <p><b>Chief Complaints :</b></p>
          <textarea name="complaints" value={formData.complaints} onChange={handleChange}/>
        </div>

        <div className="section">
          <p><b>Examination :</b></p>
          <textarea name="examination" value={formData.examination} onChange={handleChange}/>
        </div>

        <div className="section">
          <p><b>Past History :</b></p>
          <textarea name="past_history" value={formData.past_history} onChange={handleChange}/>
        </div>

        <div className="section">
          <p><b>Allergy History :</b></p>
          <textarea name="allergy" value={formData.allergy} onChange={handleChange}/>
        </div>

        <div className="section">
          <p><b>Diagnosis :</b></p>
          <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange}/>
        </div>

        {/* PRESCRIPTION */}

        <div className="section">
          <p><b>Prescription (Rx)</b></p>

          {medicines.map((med, index) => (
            <div key={index} className="medicine-row">

              <input
                placeholder="Medicine name"
                value={med.name}
                onChange={(e) => {
                  const updated = [...medicines];
                  updated[index].name = e.target.value;
                  setMedicines(updated);
            }}
          />

              <input
                placeholder="Dose / Frequency"
                value={med.dose}
                onChange={(e) => {
                  const updated = [...medicines];
                  updated[index].dose = e.target.value;
                  setMedicines(updated);
            }}
          />

            </div>
          ))}

          <button onClick={addMedicine}>+ Add Medicine</button>

        </div>

        {/* ADVICE */}

        <div className="section">
          <p><b>Advice :</b></p>
          <textarea name="advice" value={formData.advice} onChange={handleChange}/>
        </div>

        <div className="section">
          <p><b>Investigations Advised :</b></p>
          <textarea name="investigations" value={formData.investigations} onChange={handleChange}/>
        </div>

        <div className="print-section">
        <button className="print-btn" onClick={() => window.print()}>
        🖨 Print Prescription
        </button>
        </div>

        <div style={{ marginTop: "20px", textAlign: "center" }}>

          <div className="print-section">

          <button className="print-btn" onClick={() => window.print()}>
          🖨 Print
        </button>

        <button className="print-btn" onClick={handleDownloadPDF}>
          📄 Download PDF
        </button>

</div>
  <button
    onClick={handleSubmit}
    style={{
      padding: "12px 20px",
      backgroundColor: "#06B6D4",
      border: "none",
      borderRadius: "8px",
      color: "white",
      cursor: "pointer",
      fontSize: "16px"
    }}
  >
    Save Consultation
  </button>
</div>

      </div>
    </div>
  );
}

export default Consultation;