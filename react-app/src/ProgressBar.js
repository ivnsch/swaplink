import React from "react";
import "./App.css";

const ProgressBar = () => {
  return (
    <div className="slider">
      <div className="line" />
      <div className="subline inc" />
      <div className="subline dec" />
    </div>
  );
};

export default ProgressBar;
