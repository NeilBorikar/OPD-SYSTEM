import { useState, useEffect } from "react";
import { getTrends } from "../services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, Activity } from "lucide-react";

const Trends = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const prn = localStorage.getItem("universal_prn");

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const data = await getTrends(prn);
        setTrendsData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (prn) fetchTrends();
  }, [prn]);

  if (loading) {
    return <div className="loading" style={{ height: "300px" }}></div>;
  }

  if (!trendsData) return <div style={styles.container}>No trend data available.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <TrendingUp size={32} color="#0ea5e9" />
        <h1 style={styles.title}>Personal Health Trends</h1>
        <p style={styles.subtitle}>Factual observations from your medical records over time.</p>
      </div>

      <div style={styles.grid}>
        {/* Visits Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Visits Over Time</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsData.visits_per_month}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medicines Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Medicines Prescribed</h3>
          <div style={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendsData.medicines_per_visit}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="count" stroke="#10b981" fill="#d1fae5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vitals Charts - Display if data exists */}
        {trendsData.vitals_over_time?.bp?.length > 0 && (
          <div style={{...styles.chartCard, gridColumn: "1 / -1"}}>
            <h3 style={styles.chartTitle}>Blood Pressure Records</h3>
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendsData.vitals_over_time.bp.map(v => ({
                  date: v.date,
                  systolic: parseInt(v.value.split('/')[0]),
                  diastolic: parseInt(v.value.split('/')[1])
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}} />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div style={styles.infoBox}>
        <Activity size={24} color="#0ea5e9" />
        <div>
          <h4 style={{margin: "0 0 0.5rem 0", color: "#0f172a"}}>Understanding your trends</h4>
          <p style={{margin: 0, color: "#475569", fontSize: "0.95rem"}}>
            These charts reflect the raw data recorded in your clinical visits. An increase in visits or prescriptions does not necessarily indicate worsening health. Please discuss any patterns you observe with your doctor.
          </p>
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
  header: {
    marginBottom: "3rem",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem"
  },
  title: {
    fontSize: "2rem",
    color: "#0f172a",
    margin: 0
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
    margin: 0
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem"
  },
  chartCard: {
    background: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)"
  },
  chartTitle: {
    margin: "0 0 1.5rem 0",
    color: "#0f172a",
    fontSize: "1.1rem"
  },
  chartWrapper: {
    height: "250px",
    width: "100%"
  },
  infoBox: {
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    padding: "1.5rem",
    borderRadius: "12px",
    display: "flex",
    gap: "1.5rem",
    alignItems: "flex-start"
  }
};

export default Trends;
