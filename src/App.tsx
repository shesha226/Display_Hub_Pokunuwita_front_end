import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { API_URL } from "./api/api";
import Orders from "./pages/Orders";
import Customer from "./pages/Customers";
import Navbar from "./components/Navbar";
import Accessories from "./pages/Accessories";
import Repairs from "./pages/Repairs";
import Payments from "./pages/Payments";
import Reports from "./pages/Report";
import Users from "./pages/User";
import Login from "./pages/loging";

function App() {
  useEffect(() => {
    const testAPI = async () => {
      try {
        const res = await fetch(`${API_URL}/test`);
        const data = await res.json();
        console.log("API test response:", data);
      } catch (err) {
        console.error("API error:", err);
      }
    };

    testAPI();
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      
      <Routes>
        {/* Redirect root path to /orders */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customer />} />
        <Route path="/Accessories" element={<Accessories />} />
        <Route path="/Repairs" element={<Repairs />} />
        <Route path="/Payments" element={<Payments />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/Users" element={<Users />} />
        <Route path="/login" element={<Login />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
