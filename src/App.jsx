
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9RlnEvhCTugFezMOSmtQqq0gWNr8DFB272qpw6T1hp3T13mouRtjkJfCrHpMHhTsiKJTx74-CjQCL/pubhtml";

function parseCSV(text) {
  const rows = text.trim().split("\n").map((row) => row.split(","));
  const headers = rows[0].map((h) => h.trim());

  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ? row[i].trim() : "";
    });
    return obj;
  });
}

export default function App() {
  const [data, setData] = useState([]);
  const [regInput, setRegInput] = useState("");
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const COLLEGE_NAME = "GOVERNMENT ENGINEERING COLLEGE SHEOHAR ";

  useEffect(() => {
    async function loadData() {
      if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE")) return;
      const res = await fetch(SHEET_CSV_URL);
      const text = await res.text();
      setData(parseCSV(text));
    }
    loadData();
  }, []);

  const handleLogin = () => {
    if (role === "admin" && username === "admin" && password === "admin123") {
      setUser("Admin");
    } else if (role === "student" && username) {
      setUser(username);
    } else {
      alert("Invalid Login");
    }
  };

  const handleSearch = () => {
    const found = data.find((row) =>
      Object.values(row)[0]?.toLowerCase() === regInput.toLowerCase()
    );
    setResult(found || null);
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.text("Student Fee Receipt", 20, 20);
    let y = 40;
    Object.entries(result).forEach(([k, v]) => {
      doc.text(`${k}: ${v}`, 20, y);
      y += 10;
    });
    doc.save("fee_dues.pdf");
  };

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h2>{COLLEGE_NAME}</h2>
        <select onChange={(e) => setRole(e.target.value)}>
          <option value="student">Student Login</option>
          <option value="admin">Admin Login</option>
        </select>
        <br /><br />
        <input placeholder="Username" onChange={(e)=>setUsername(e.target.value)} />
        <br /><br />
        <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
        <br /><br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <motion.div style={{ padding: 40 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2>{COLLEGE_NAME} - Dashboard</h2>

      <input
        placeholder="Registration Number"
        value={regInput}
        onChange={(e) => setRegInput(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Student Record</h3>
          {Object.entries(result).map(([k, v]) => (
            <p key={k}><b>{k}</b>: {v}</p>
          ))}
          <button onClick={exportPDF}>Export PDF</button>
        </div>
      )}
    </motion.div>
  );
}
