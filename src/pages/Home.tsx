import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Home: React.FC = () => {
  return (
    <div>
      <Navbar />
      <div className="page-content">
        <Outlet /> {/* This is where nested routes will render */}
      </div>
    </div>
  );
};

export default Home;
