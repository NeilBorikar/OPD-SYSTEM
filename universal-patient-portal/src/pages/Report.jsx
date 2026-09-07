import { useState, useEffect, useRef } from "react";
import { getReport } from "../services/api";
import { Download, FileText, CheckCircle } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Report = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const prn = localStorage.getItem("universal_prn");
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(prn);
        setReportData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (prn) fetchReport();
  }, [prn]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CorePulse_HealthReport_${prn}.pdf`);
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="loading" style={{ height: "300px" }}></div>;
  }

  if (!reportData || !reportData.sections) {
    return <div style={{textAlign: "center", padding: "3rem"}}>Unable to generate report. No records found.</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.actionBar}>
        <div>
          <h1 style={{margin: "0 0 0.5rem 0", color: "#0f172a", fontSize: "1.8rem"}}>AI Health Report</h1>
          <p style={{margin: 0, color: "#64748b"}}>A comprehensive, print-ready summary of your medical history.</p>
        </div>
        <button 
          onClick={handleDownloadPdf} 
          disabled={downloading}
          style={styles.downloadBtn}
        >
          {downloading ? <span className="loading" style={{width: "20px", height: "20px"}}/> : <Download size={18} />}
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div style={styles.reportWrapper}>
        {/* Printable Area */}
        <div ref={reportRef} style={styles.printableReport}>
          {/* Header */}
          <div style={styles.reportHeader}>
            <div style={styles.brandGroup}>
              <div style={{...styles.pulseBox, width: "60px", height: "20px", marginBottom: "0.5rem"}}>
                 <svg viewBox="0 0 200 50" preserveAspectRatio="none" style={{width: "100%", height: "100%"}}>
                    <path d="M0,25 L50,25 L60,10 L75,40 L85,25 L200,25" fill="none" stroke="#0ea5e9" strokeWidth="6" strokeLinejoin="round" />
                 </svg>
              </div>
              <h2 style={{margin: 0, fontSize: "1.5rem", color: "#0f172a"}}>COREPULSE</h2>
              <p style={{margin: 0, color: "#64748b", fontSize: "0.85rem", letterSpacing: "1px"}}>UNIVERSAL HEALTH RECORD</p>
            </div>
            
            <div style={styles.patientInfoBox}>
              <div style={styles.infoRow}><span>Patient:</span> <strong>{reportData.patient?.name || "Unknown"}</strong></div>
              <div style={styles.infoRow}><span>PRN:</span> <strong>{reportData.patient?.prn}</strong></div>
              <div style={styles.infoRow}><span>Date:</span> <strong>{new Date().toLocaleDateString()}</strong></div>
            </div>
          </div>

          <div style={styles.divider}></div>

          {/* Activity Overview */}
          <div style={styles.section}>
             <h3 style={styles.sectionTitle}><Activity size={18}/> Healthcare Activity Overview</h3>
             <p style={{color: "#334155", lineHeight: "1.6", marginBottom: "1rem"}}>
                {reportData.sections.activity_overview_text || "Activity overview successfully generated from your records."}
             </p>
          </div>

          {/* Narrative Summaries */}
          <div style={styles.grid2Col}>
             <div style={styles.section}>
                <h3 style={styles.sectionTitle}><FileText size={18}/> Recent Visits</h3>
                <p style={styles.narrativeText}>{reportData.sections.recent_visits_narrative}</p>
             </div>
             
             <div style={styles.section}>
                <h3 style={styles.sectionTitle}><FileText size={18}/> Recent Prescriptions</h3>
                <p style={styles.narrativeText}>{reportData.sections.recent_prescriptions_narrative}</p>
             </div>
          </div>

          {/* Suggested Questions */}
          {reportData.sections.questions_for_doctor && reportData.sections.questions_for_doctor.length > 0 && (
             <div style={{...styles.section, background: "#f8fafc", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0"}}>
                <h3 style={styles.sectionTitle}>Points for Discussion with Your Doctor</h3>
                <p style={{color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem"}}>Based on factual observations from your records, you may want to ask about:</p>
                <ul style={{margin: 0, paddingLeft: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem"}}>
                   {reportData.sections.questions_for_doctor.map((q, idx) => (
                      <li key={idx} style={{color: "#0f172a", lineHeight: "1.5"}}>{q}</li>
                   ))}
                </ul>
             </div>
          )}

          {/* Footer Disclaimer */}
          <div style={styles.reportFooter}>
             <p><strong>IMPORTANT DISCLAIMER:</strong> This report is automatically generated by organizing information recorded in your CorePulse account. It is NOT a medical diagnosis, it does NOT predict health outcomes, and it does NOT recommend treatments. Please discuss all medical decisions with a qualified healthcare provider.</p>
             <p style={{marginTop: "0.5rem", color: "#94a3b8"}}>Generated via CorePulse Universal Patient Portal at {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "2rem"
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2rem"
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "#0f172a",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s"
  },
  reportWrapper: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
    padding: "3rem",
    overflowX: "auto"
  },
  printableReport: {
    background: "white",
    width: "100%",
    minWidth: "800px",
    color: "#0f172a"
  },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2rem"
  },
  patientInfoBox: {
    background: "#f8fafc",
    padding: "1rem 1.5rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: "250px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.95rem",
    color: "#475569"
  },
  divider: {
    height: "2px",
    background: "#e2e8f0",
    marginBottom: "2rem"
  },
  grid2Col: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "2rem"
  },
  section: {
    marginBottom: "2rem"
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#0284c7",
    margin: "0 0 1rem 0",
    fontSize: "1.2rem",
    borderBottom: "1px solid #e0f2fe",
    paddingBottom: "0.5rem"
  },
  narrativeText: {
    color: "#334155",
    lineHeight: "1.6",
    margin: 0
  },
  reportFooter: {
    marginTop: "4rem",
    borderTop: "2px solid #e2e8f0",
    paddingTop: "1.5rem",
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: "1.5"
  }
};

export default Report;
