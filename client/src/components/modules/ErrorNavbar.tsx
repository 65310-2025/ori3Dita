import React from "react";

import { useNavigate } from "react-router-dom";

import logo from "../../../logo_text.png";
import "./LandingNavbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="Navbar">
      <div className="Navbar-items" style={{ width: "100vw" }}>
        <a
          className="Navbar-link"
          onClick={() => {
            navigate("/");
          }}
        >
          <img src={logo} alt="Logo" className="Navbar-logo" />
        </a>
        <a
          className="Navbar-link"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </a>
        <a
          className="Navbar-link"
          onClick={() => {
            navigate("/docs");
          }}
        >
          Docs
        </a>
      </div>
    </div>
  );
};

export default Navbar;
