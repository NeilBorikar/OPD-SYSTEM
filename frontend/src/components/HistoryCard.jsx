import { useState } from "react";

const HistoryCard = ({ record }) => {
  const [open, setOpen] = useState(false);

  const vitals = [
    ["BP", record.bp],
    ["Pulse", record.pulse],
    ["SpO₂", record.spo2],
    ["Wt", record.weight],
    ["Ht", record.height],
    ["BMI", record.bmi],
  ].filter(([, v]) => v != null && String(v).trim() !== "");

  return (
    <article className={`history-card${open ? " history-card--open" : ""}`}>
      <button
        type="button"
        className="history-card-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <h3 className="history-card-title">{record.patient_name || "Patient"}</h3>
          <p className="history-card-meta">
            PRN {record.prn}
            {record.age != null && record.age !== "" ? ` · ${record.age} yrs` : ""}
            {record.gender ? ` · ${record.gender}` : ""}
          </p>
        </div>
        <span className="history-card-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open && (
        <div className="history-card-body">
          {vitals.length > 0 && (
            <div className="history-pills" role="list">
              {vitals.map(([k, v]) => (
                <span key={k} className="history-pill" role="listitem">
                  {k}: {v}
                </span>
              ))}
            </div>
          )}

          <p>
            <strong>Chief complaints</strong> — {record.complaints || "—"}
          </p>
          <p>
            <strong>Examination</strong> — {record.examination || "—"}
          </p>
          <p>
            <strong>Past history</strong> — {record.past_history || "—"}
          </p>
          <p>
            <strong>Allergy</strong> — {record.allergy || "—"}
          </p>

          <p>
            <strong>Diagnosis</strong> — {record.diagnosis || "—"}
          </p>

          <h4>Medicines</h4>
          {record.medicines?.length ? (
            record.medicines.map((med, index) => (
              <p key={index}>
                {med.name} — {med.dose}
              </p>
            ))
          ) : (
            <p>—</p>
          )}

          <p>
            <strong>Advice</strong> — {record.advice || "—"}
          </p>
        </div>
      )}
    </article>
  );
};

export default HistoryCard;
