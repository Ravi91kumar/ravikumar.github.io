
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkcb3Ky6EgeRlpGOCYnah4O6cgte4lsAEfhXBDG-Y-L1ba5CN1HJdiaz38eTPuqFFK-nxEUsiM1i6e/pub?output=csv";
const COLLEGE_NAME = "Government Engineering College Sheohar";
const LOGO_PATH = "/logo.png";

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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PASTE")) return;
      const res = await fetch(SHEET_CSV_URL);
      const text = await res.text();
      setData(parseCSV(text));
      setTimestamp(new Date().toLocaleString());
    }
    loadData();
  }, []);

  const handleLogin = () => {
    const student = data.find(
      row =>
        row.Registration?.toLowerCase() === username.toLowerCase() &&
        row.DOB?.replace(/\//g, "") === password
    );

    if (student) {
      setUser(student.Name);
      setResult(student);
      setRegInput(student.Registration);
    } else alert("Invalid Login");
  };

  const handleSearch = () => {
    const found = data.find(
      row => row.Registration?.toLowerCase() === regInput.toLowerCase()
    );
    setResult(found || null);
    setTimestamp(new Date().toLocaleString());
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(COLLEGE_NAME, 105, 15, { align: "center" });
    doc.setFontSize(14);
    doc.text("Hostel and Mess Bill", 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Generated: " + new Date().toLocaleString(), 140, 32);

    let y = 45;
    doc.text("Reg No: " + result.Registration, 20, y);
    doc.text("Name: " + result.Name, 70, y);
    doc.text("Course: " + result.Course, 130, y);

    y += 10;
    doc.text("Total Payable: " + result.TotalFee, 20, y);
    y += 8;
    doc.text("Total Paid: " + result.Paid, 20, y);
    y += 8;
    doc.text("Due Amount: " + result.Due, 20, y);

    doc.save("Hostel_Bill.pdf");
  };

  if (!user) {
    return (
      <div style={{minHeight:"100vh",display:"flex",justifyContent:"center",
      alignItems:"center",background:"linear-gradient(90deg,#1e3a8a,#2563eb)"}}>
        <div style={{background:"white",padding:30,borderRadius:12,width:350,textAlign:"center"}}>
          <img src={LOGO_PATH} height="60" alt="logo" />
          <h3>{COLLEGE_NAME}</h3>

          <input placeholder="Registration Number"
            onChange={e=>setUsername(e.target.value)}
            style={{width:"100%",padding:8,marginBottom:10}} />

          <input type="password" placeholder="DOB DDMMYYYY"
            onChange={e=>setPassword(e.target.value)}
            style={{width:"100%",padding:8,marginBottom:10}} />

          <button onClick={handleLogin}
            style={{width:"100%",padding:10,background:"#1e40af",color:"white",border:"none"}}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#f3f4f6",padding:20,display:"flex",justifyContent:"center"}}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{width:"100%",maxWidth:900}}>

        <div style={{background:"white",padding:20,borderRadius:10}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO_PATH} height="50" />
            <div>
              <h3>{COLLEGE_NAME}</h3>
              <p>Last Updated: {timestamp}</p>
            </div>
          </div>

          <h3>Search Bill</h3>
          <input value={regInput} onChange={e=>setRegInput(e.target.value)}
            style={{padding:8,width:"70%",marginRight:10}} />
          <button onClick={handleSearch}>Search</button>
        </div>

        {result && (
          <div style={{background:"white",padding:20,borderRadius:10,marginTop:20}}>
            <p><b>Name:</b> {result.Name}</p>
            <p><b>Total Payable:</b> {result.TotalFee}</p>
            <p><b>Total Paid:</b> {result.Paid}</p>
            <p><b>Due:</b> {result.Due}</p>

            <button onClick={exportPDF}
              style={{marginTop:10,padding:10,background:"green",color:"white",border:"none"}}>
              Download Bill PDF
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}
