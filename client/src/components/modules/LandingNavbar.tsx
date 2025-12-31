import React, { useContext, useEffect, useState } from "react";

import { googleLogout } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import logo from "../../../logo_text.png";
import themeToggle from "../../assets/icons/theme-toggle.svg";
import { ThemeContext, UserContext } from "../App";
import { useClickOutside } from "../hooks/clickOutside";
import "./LandingNavbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(UserContext);
  const themeContext = useContext(ThemeContext);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const { theme, setTheme } = themeContext || {
    theme: "dark",
    setTheme: () => {},
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!context) {
    return null;
  }

  const { userId, userName, handleLogout } = context;

  useEffect(() => {
    if (userId && userName) {
      setDisplayName(userName);
    } else {
      setDisplayName(null);
    }
  }, [userId, userName]);

  const handleLogoutAndNavigate = () => {
    console.log("Logging out...");
    setDisplayName(null);
    setDropdownVisible(false);
    googleLogout();
    handleLogout();
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const dropdownRef = useClickOutside<HTMLDivElement>(() => {
    setDropdownVisible(false);
  });

  const dropdown = (
    <div className="Navbar-links">
      <button
        onClick={() => {
          navigate("/library");
        }}
        className="Navbar-dropdown-link"
      >
        Library
      </button>
      <button
        onClick={handleLogoutAndNavigate}
        className="Navbar-dropdown-link"
      >
        Logout
      </button>
    </div>
  );

  const loginElement = displayName ? (
    <div className="Navbar-dropdown">
      <div className="Navbar-link Navbar-dropdown-username-wrap">
        <button onClick={toggleDropdown} className="Navbar-dropdown-username">
          Welcome, {displayName}
        </button>
      </div>
      {dropdownVisible ? dropdown : null}
    </div>
  ) : (
    <button
      className="Navbar-link"
      onClick={() => {
        navigate("/login");
      }}
    >
      Login / Sign Up
    </button>
  );

  return (
    <div className="Navbar">
      <div className="Navbar-items">
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
      <div className="Navbar-login" ref={dropdownRef}>
        <img
          src={themeToggle}
          alt="Theme Toggle"
          className="Navbar-theme-toggle"
          onClick={toggleTheme}
        />
        {loginElement}
      </div>
    </div>
  );
};

export default Navbar;
