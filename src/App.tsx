import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { API_URL } from "./api/api";
import Orders from "./pages/Orders";
import Customer from "./pages/Customers";
import Accessories from "./pages/Accessories";
import Repairs from "./pages/Repairs";
import Payments from "./pages/Payments";
import Reports from "./pages/Report";
import Users from "./pages/User";
import Login from "./pages/loging";
import Home from "./pages/Home";

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
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes with Home layout */}
        <Route path="/" element={<Home />}>
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customer />} />
          <Route path="accessories" element={<Accessories />} />
          <Route path="repairs" element={<Repairs />} />
          <Route path="payments" element={<Payments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="home" element={<Navigate to="/orders" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
