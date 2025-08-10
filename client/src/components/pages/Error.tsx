import React from "react";

import Navbar from "../modules/LandingNavbar";
import "./NotFound.css";

const Error: React.FC = () => {
  console.log("500 Internal Server Error");
  return (
    <div>
      <Navbar />
      <div className="Home">
        <div className="Notfound-container">
          <h1>500 Internal Server Error</h1>
          <p>We apologize for the inconvenience.</p>
          <button className="Notfound-home-button">
            <a className="Notfound-home-link" href="/">
              Go back to the homepage
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
