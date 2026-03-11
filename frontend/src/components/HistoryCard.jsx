const HistoryCard = ({ record }) => {

  return (

    <div style={styles.card}>

      <h3>{record.patient_name}</h3>

      <p><strong>PRN:</strong> {record.prn}</p>
      <p><strong>Age:</strong> {record.age}</p>
      <p><strong>Gender:</strong> {record.gender}</p>

      <hr/>

      <p><strong>BP:</strong> {record.bp}</p>
      <p><strong>Pulse:</strong> {record.pulse}</p>
      <p><strong>SPO2:</strong> {record.spo2}</p>
      <p><strong>Weight:</strong> {record.weight}</p>
      <p><strong>Height:</strong> {record.height}</p>
      <p><strong>BMI:</strong> {record.bmi}</p>

      <hr/>

      <p><strong>Chief Complaints:</strong> {record.complaints}</p>
      <p><strong>Examination:</strong> {record.examination}</p>
      <p><strong>Past History:</strong> {record.past_history}</p>
      <p><strong>Allergy:</strong> {record.allergy}</p>

      <hr/>

      <p><strong>Diagnosis:</strong> {record.diagnosis}</p>

      <h4>Medicines</h4>

      {record.medicines?.map((med, index) => (
        <p key={index}>
          {med.name} — {med.dose}
        </p>
      ))}

      <hr/>

      <p><strong>Advice:</strong> {record.advice}</p>

    </div>

  );
};


const styles = {

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    margin: "20px 0",
    boxShadow: "0 6px 16px rgba(0,0,0,0.1)"
  }

};

export default HistoryCard;